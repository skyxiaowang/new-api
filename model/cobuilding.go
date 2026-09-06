package model

import (
	"errors"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"gorm.io/gorm"
)

// 共建计划申请类型
const (
	CoBuildingTypeXPost       = 1 // X 发帖活动
	CoBuildingTypeSponsorship = 2 // 申请赞助
)

// 共建计划支持类型（仅赞助申请使用）
const (
	CoBuildingSupportBalance = 1 // 余额支持
	CoBuildingSupportFull    = 2 // 全额赞助
	CoBuildingSupportDiscount = 3 // 专属折扣
)

// 共建计划审核状态
const (
	CoBuildingStatusPending  = 0 // 待审核
	CoBuildingStatusApproved = 1 // 已通过
	CoBuildingStatusRejected = 2 // 未通过
)

// CoBuilding 共建计划申请记录
type CoBuilding struct {
	Id           int     `json:"id" gorm:"primaryKey;autoIncrement"`
	UserId       int     `json:"user_id" gorm:"not null;index:idx_cobuilding_user,priority:1"`
	Username     string  `json:"username" gorm:"type:varchar(64);not null"` // 提交时快照，便于管理员列表展示
	Type         int     `json:"type" gorm:"not null;index:idx_cobuilding_type"`
	Status       int     `json:"status" gorm:"not null;index:idx_cobuilding_status"`
	PostUrl      *string `json:"post_url" gorm:"type:varchar(255);uniqueIndex"` // NULL=非发帖类；唯一索引保证每条动态仅可提交一次
	ProjectName  string  `json:"project_name" gorm:"type:varchar(128)"`
	Contact      string  `json:"contact" gorm:"type:varchar(255)"`
	Website      string  `json:"website" gorm:"type:varchar(512)"`
	Github       string  `json:"github" gorm:"type:varchar(512)"`
	SupportType  int     `json:"support_type"`
	Scale        string  `json:"scale" gorm:"type:varchar(128)"`
	Description  string  `json:"description" gorm:"type:text"`
	AgreePromo   bool    `json:"agree_promo"`
	RewardQuota  int     `json:"reward_quota"` // 通过时的奖励额度（内部额度单位，0=未奖励）
	ReviewNote   string  `json:"review_note" gorm:"type:varchar(1024)"` // 通过=备注（可选），不通过=原因（必填）
	ReviewerId   int     `json:"reviewer_id"`
	ReviewerName string  `json:"reviewer_name" gorm:"type:varchar(64)"`
	ReviewedAt   int64   `json:"reviewed_at" gorm:"bigint"`
	CreatedAt    int64   `json:"created_at" gorm:"bigint"`
	UpdatedAt    int64   `json:"updated_at" gorm:"bigint"`
}

func (CoBuilding) TableName() string {
	return "cobuildings"
}

// 同类型待审核记录上限，防止重复刷提交
const maxPendingCoBuildingsPerType = 10

// CreateCoBuilding 用户提交共建计划申请
func CreateCoBuilding(item *CoBuilding) error {
	if item.Type == CoBuildingTypeXPost && item.PostUrl != nil {
		var count int64
		err := DB.Model(&CoBuilding{}).Where("post_url = ?", *item.PostUrl).Count(&count).Error
		if err != nil {
			return err
		}
		if count > 0 {
			return errors.New("该动态链接已提交过，每条动态仅可提交一次")
		}
	}

	var pending int64
	err := DB.Model(&CoBuilding{}).
		Where("user_id = ? AND type = ? AND status = ?", item.UserId, item.Type, CoBuildingStatusPending).
		Count(&pending).Error
	if err != nil {
		return err
	}
	if pending >= maxPendingCoBuildingsPerType {
		return errors.New("您同类型的待审核申请过多，请等待审核完成后再提交")
	}

	item.Status = CoBuildingStatusPending
	item.RewardQuota = 0
	item.ReviewNote = ""
	item.ReviewerId = 0
	item.ReviewerName = ""
	item.ReviewedAt = 0
	now := common.GetTimestamp()
	item.CreatedAt = now
	item.UpdatedAt = now
	return DB.Create(item).Error
}

// GetUserCoBuildings 获取用户的共建计划记录（分页）
func GetUserCoBuildings(userId int, pageInfo *common.PageInfo) (items []*CoBuilding, total int64, err error) {
	tx := DB.Begin()
	if tx.Error != nil {
		return nil, 0, tx.Error
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	err = tx.Model(&CoBuilding{}).Where("user_id = ?", userId).Count(&total).Error
	if err != nil {
		tx.Rollback()
		return nil, 0, err
	}

	err = tx.Where("user_id = ?", userId).Order("id desc").
		Limit(pageInfo.GetPageSize()).Offset(pageInfo.GetStartIdx()).Find(&items).Error
	if err != nil {
		tx.Rollback()
		return nil, 0, err
	}

	if err = tx.Commit().Error; err != nil {
		return nil, 0, err
	}
	return items, total, nil
}

// GetAllCoBuildings 获取全平台共建计划记录（管理员使用，支持筛选）
func GetAllCoBuildings(pageInfo *common.PageInfo, keyword string, status int, typ int) (items []*CoBuilding, total int64, err error) {
	tx := DB.Begin()
	if tx.Error != nil {
		return nil, 0, tx.Error
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	query := tx.Model(&CoBuilding{})
	if keyword != "" {
		like := "%" + keyword + "%"
		query = query.Where("username LIKE ? OR project_name LIKE ? OR contact LIKE ?", like, like, like)
	}
	if status >= 0 {
		query = query.Where("status = ?", status)
	}
	if typ > 0 {
		query = query.Where("type = ?", typ)
	}

	err = query.Count(&total).Error
	if err != nil {
		tx.Rollback()
		return nil, 0, err
	}

	err = query.Order("id desc").
		Limit(pageInfo.GetPageSize()).Offset(pageInfo.GetStartIdx()).Find(&items).Error
	if err != nil {
		tx.Rollback()
		return nil, 0, err
	}

	if err = tx.Commit().Error; err != nil {
		return nil, 0, err
	}
	return items, total, nil
}

// ReviewCoBuilding 管理员审核共建计划记录
// 通过时把奖励额度加到用户账户（事务内完成，幂等：已审核记录不可再次审核）
// 返回被审核记录的 userId，便于调用方在事务外记录日志
func ReviewCoBuilding(id int, approve bool, rewardQuota int, note string, reviewerId int, reviewerName string) (int, error) {
	var userId int
	err := DB.Transaction(func(tx *gorm.DB) error {
		item := &CoBuilding{}
		if err := lockForUpdate(tx).Where("id = ?", id).First(item).Error; err != nil {
			return errors.New("记录不存在")
		}

		if item.Status != CoBuildingStatusPending {
			return errors.New("该记录已审核过，不能重复审核")
		}

		if approve {
			if rewardQuota <= 0 {
				return errors.New("奖励额度必须大于 0")
			}
			// 与补单一致：事务内直接写库，保证记录与额度一致
			if err := tx.Model(&User{}).Where("id = ?", item.UserId).
				Update("quota", gorm.Expr("quota + ?", rewardQuota)).Error; err != nil {
				return errors.New("奖励额度发放失败")
			}
		}

		item.Status = CoBuildingStatusRejected
		if approve {
			item.Status = CoBuildingStatusApproved
			item.RewardQuota = rewardQuota
		}
		item.ReviewNote = strings.TrimSpace(note)
		item.ReviewerId = reviewerId
		item.ReviewerName = reviewerName
		item.ReviewedAt = common.GetTimestamp()
		item.UpdatedAt = common.GetTimestamp()
		if err := tx.Save(item).Error; err != nil {
			return err
		}

		userId = item.UserId
		return nil
	})
	if err != nil {
		return 0, err
	}

	// 事务外同步用户额度缓存，避免阻塞事务
	if approve && rewardQuota > 0 {
		syncCreditUserQuotaCache(userId, rewardQuota, "cobuilding reward")
	}
	return userId, nil
}
