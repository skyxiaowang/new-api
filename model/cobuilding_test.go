package model

import (
	"fmt"
	"testing"

	"github.com/QuantumNous/new-api/common"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gorm.io/gorm"
)

func clearCoBuildingTables(t *testing.T) {
	t.Helper()
	require.NoError(t, DB.Session(&gorm.Session{AllowGlobalUpdate: true}).Unscoped().Delete(&CoBuilding{}).Error)
	// User 为软删除模型，必须 Unscoped 硬删，否则残留行占用 aff_code 唯一索引
	require.NoError(t, DB.Unscoped().Where("id IN ?", []int{9001, 9002}).Delete(&User{}).Error)
}

func createCoBuildingTestUser(t *testing.T, id int, username string, quota int) {
	t.Helper()
	// aff_code 有唯一索引，必须为每个测试用户填充不同值
	user := &User{Id: id, Username: username, Quota: quota, Role: 1, Status: 1,
		AffCode: fmt.Sprintf("cob%d", id)}
	require.NoError(t, DB.Create(user).Error)
	t.Cleanup(func() {
		require.NoError(t, DB.Unscoped().Delete(user).Error)
	})
}

func newXPostItem(userId int, username string, url string) *CoBuilding {
	return &CoBuilding{
		UserId:   userId,
		Username: username,
		Type:     CoBuildingTypeXPost,
		PostUrl:  &url,
	}
}

func TestCreateCoBuildingRejectsDuplicatePostUrl(t *testing.T) {
	require.NoError(t, DB.AutoMigrate(&CoBuilding{}))
	clearCoBuildingTables(t)
	createCoBuildingTestUser(t, 9001, "cob-user-a", 0)

	first := newXPostItem(9001, "cob-user-a", "https://x.com/foo/status/111")
	require.NoError(t, CreateCoBuilding(first))
	assert.Equal(t, CoBuildingStatusPending, first.Status)

	// 同一链接再次提交（即使换用户）被拒
	second := newXPostItem(9001, "cob-user-a", "https://x.com/foo/status/111")
	err := CreateCoBuilding(second)
	require.Error(t, err)
	assert.Contains(t, err.Error(), "已提交过")
}

func TestCreateCoBuildingLimitsPendingPerType(t *testing.T) {
	require.NoError(t, DB.AutoMigrate(&CoBuilding{}))
	clearCoBuildingTables(t)
	createCoBuildingTestUser(t, 9001, "cob-user-a", 0)

	for i := 0; i < maxPendingCoBuildingsPerType; i++ {
		item := newXPostItem(9001, "cob-user-a", fmt.Sprintf("https://x.com/foo/status/%d", 100+i))
		require.NoError(t, CreateCoBuilding(item))
	}

	overflow := newXPostItem(9001, "cob-user-a", "https://x.com/foo/status/999")
	err := CreateCoBuilding(overflow)
	require.Error(t, err)
	assert.Contains(t, err.Error(), "待审核申请过多")
}

func TestReviewCoBuildingApproveCreditsQuotaOnce(t *testing.T) {
	require.NoError(t, DB.AutoMigrate(&CoBuilding{}))
	clearCoBuildingTables(t)
	createCoBuildingTestUser(t, 9001, "cob-user-a", 100)
	createCoBuildingTestUser(t, 9002, "cob-admin", 0)

	item := newXPostItem(9001, "cob-user-a", "https://x.com/foo/status/222")
	require.NoError(t, CreateCoBuilding(item))

	targetUserId, err := ReviewCoBuilding(item.Id, true, 5000, "不错", 9002, "cob-admin")
	require.NoError(t, err)
	assert.Equal(t, 9001, targetUserId)

	var user User
	require.NoError(t, DB.Where("id = ?", 9001).First(&user).Error)
	assert.Equal(t, 100+5000, user.Quota)

	var reviewed CoBuilding
	require.NoError(t, DB.Where("id = ?", item.Id).First(&reviewed).Error)
	assert.Equal(t, CoBuildingStatusApproved, reviewed.Status)
	assert.Equal(t, 5000, reviewed.RewardQuota)
	assert.Equal(t, "cob-admin", reviewed.ReviewerName)
	assert.Equal(t, 9002, reviewed.ReviewerId)
	assert.NotZero(t, reviewed.ReviewedAt)

	// 幂等：重复审核报错且不再加款
	_, err = ReviewCoBuilding(item.Id, true, 5000, "", 9002, "cob-admin")
	require.Error(t, err)
	assert.Contains(t, err.Error(), "已审核过")
	require.NoError(t, DB.Where("id = ?", 9001).First(&user).Error)
	assert.Equal(t, 100+5000, user.Quota)
}

func TestReviewCoBuildingRejectKeepsQuota(t *testing.T) {
	require.NoError(t, DB.AutoMigrate(&CoBuilding{}))
	clearCoBuildingTables(t)
	createCoBuildingTestUser(t, 9001, "cob-user-a", 100)
	createCoBuildingTestUser(t, 9002, "cob-admin", 0)

	item := &CoBuilding{
		UserId:      9001,
		Username:    "cob-user-a",
		Type:        CoBuildingTypeSponsorship,
		ProjectName: "demo",
		Contact:     "a@b.c",
		SupportType: CoBuildingSupportBalance,
		Description: "desc",
	}
	require.NoError(t, CreateCoBuilding(item))

	_, err := ReviewCoBuilding(item.Id, false, 0, "内容与要求不符", 9002, "cob-admin")
	require.NoError(t, err)

	var user User
	require.NoError(t, DB.Where("id = ?", 9001).First(&user).Error)
	assert.Equal(t, 100, user.Quota)

	var reviewed CoBuilding
	require.NoError(t, DB.Where("id = ?", item.Id).First(&reviewed).Error)
	assert.Equal(t, CoBuildingStatusRejected, reviewed.Status)
	assert.Equal(t, 0, reviewed.RewardQuota)
	assert.Equal(t, "内容与要求不符", reviewed.ReviewNote)
	assert.Equal(t, "cob-admin", reviewed.ReviewerName)
}

func TestCoBuildingListFiltersAndPagination(t *testing.T) {
	require.NoError(t, DB.AutoMigrate(&CoBuilding{}))
	clearCoBuildingTables(t)
	createCoBuildingTestUser(t, 9001, "cob-user-a", 0)
	createCoBuildingTestUser(t, 9002, "cob-user-b", 0)

	approved := newXPostItem(9001, "cob-user-a", "https://x.com/a/status/1")
	require.NoError(t, CreateCoBuilding(approved))
	_, err := ReviewCoBuilding(approved.Id, true, 100, "", 9002, "cob-admin")
	require.NoError(t, err)

	pending := &CoBuilding{UserId: 9002, Username: "cob-user-b", Type: CoBuildingTypeSponsorship,
		ProjectName: "alpha-site", Contact: "u@b.c", SupportType: CoBuildingSupportFull, Description: "d"}
	require.NoError(t, CreateCoBuilding(pending))

	// 用户视角只看到自己的
	myItems, myTotal, err := GetUserCoBuildings(9002, &common.PageInfo{Page: 1, PageSize: 10})
	require.NoError(t, err)
	assert.Equal(t, int64(1), myTotal)
	require.Len(t, myItems, 1)
	assert.Equal(t, pending.Id, myItems[0].Id)

	// 管理员视角：状态/类型/关键字筛选
	allItems, total, err := GetAllCoBuildings(&common.PageInfo{Page: 1, PageSize: 10}, "", -1, 0)
	require.NoError(t, err)
	assert.Equal(t, int64(2), total)
	assert.Len(t, allItems, 2)

	pendingItems, total, err := GetAllCoBuildings(&common.PageInfo{Page: 1, PageSize: 10}, "", CoBuildingStatusPending, 0)
	require.NoError(t, err)
	assert.Equal(t, int64(1), total)
	require.Len(t, pendingItems, 1)
	assert.Equal(t, pending.Id, pendingItems[0].Id)

	keywordItems, total, err := GetAllCoBuildings(&common.PageInfo{Page: 1, PageSize: 10}, "alpha", -1, CoBuildingTypeSponsorship)
	require.NoError(t, err)
	assert.Equal(t, int64(1), total)
	require.Len(t, keywordItems, 1)
	assert.Equal(t, "alpha-site", keywordItems[0].ProjectName)
}
