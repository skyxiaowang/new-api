package controller

import (
	"fmt"
	"net/url"
	"strconv"
	"strings"
	"unicode/utf8"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/logger"
	"github.com/QuantumNous/new-api/model"
	"github.com/gin-gonic/gin"
	"github.com/shopspring/decimal"
)

// 共建计划奖励金额范围（美元）
const (
	coBuildingMinRewardAmount = 1
	coBuildingMaxRewardAmount = 1000
)

type SubmitCoBuildingRequest struct {
	Type        int    `json:"type"`
	PostUrl     string `json:"post_url"`
	ProjectName string `json:"project_name"`
	Contact     string `json:"contact"`
	Website     string `json:"website"`
	Github      string `json:"github"`
	SupportType int    `json:"support_type"`
	Scale       string `json:"scale"`
	Description string `json:"description"`
	AgreePromo  bool   `json:"agree_promo"`
}

type ReviewCoBuildingRequest struct {
	Id      int     `json:"id"`
	Approve bool    `json:"approve"`
	Amount  float64 `json:"amount"`
	Note    string  `json:"note"`
}

// isAllowedPostUrlHost 校验 X 动态链接主机（仅 x.com / twitter.com 及其 www 子域）
func isAllowedPostUrlHost(host string) bool {
	host = strings.ToLower(host)
	if strings.HasPrefix(host, "www.") {
		host = strings.TrimPrefix(host, "www.")
	}
	return host == "x.com" || host == "twitter.com"
}

// normalizeXPostUrl 归一化 X 动态链接：主机小写、去 www. 与端口、twitter.com 统一为
// x.com、scheme 统一为 https，使同一条动态的各种写法归并为同一字符串，命中
// post_url 唯一索引（每条动态仅可提交一次）
func normalizeXPostUrl(parsed *url.URL) string {
	host := strings.ToLower(parsed.Hostname())
	host = strings.TrimPrefix(host, "www.")
	if host == "twitter.com" {
		host = "x.com"
	}
	normalized := url.URL{
		Scheme: "https",
		Host:   host,
		Path:   parsed.EscapedPath(),
	}
	if parsed.RawQuery != "" {
		normalized.RawQuery = parsed.RawQuery
	}
	return normalized.String()
}

// SubmitCoBuilding 用户提交共建计划申请
func SubmitCoBuilding(c *gin.Context) {
	var req SubmitCoBuildingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ApiErrorMsg(c, "参数错误")
		return
	}

	userId := c.GetInt("id")

	item := &model.CoBuilding{
		UserId:      userId,
		Type:        req.Type,
		ProjectName: strings.TrimSpace(req.ProjectName),
		Contact:     strings.TrimSpace(req.Contact),
		Website:     strings.TrimSpace(req.Website),
		Github:      strings.TrimSpace(req.Github),
		SupportType: req.SupportType,
		Scale:       strings.TrimSpace(req.Scale),
		Description: strings.TrimSpace(req.Description),
		AgreePromo:  req.AgreePromo,
	}

	switch req.Type {
	case model.CoBuildingTypeXPost:
		postUrl := strings.TrimSpace(req.PostUrl)
		if postUrl == "" {
			common.ApiErrorMsg(c, "请填写 X 动态链接")
			return
		}
		if utf8.RuneCountInString(postUrl) > 255 {
			common.ApiErrorMsg(c, "动态链接过长")
			return
		}
		parsed, err := url.Parse(postUrl)
		if err != nil || parsed.Scheme != "http" && parsed.Scheme != "https" || !isAllowedPostUrlHost(parsed.Hostname()) {
			common.ApiErrorMsg(c, "请填写有效的 X 动态链接（x.com 或 twitter.com）")
			return
		}
		postUrl = normalizeXPostUrl(parsed)
		item.PostUrl = &postUrl
	case model.CoBuildingTypeSponsorship:
		if item.ProjectName == "" {
			common.ApiErrorMsg(c, "请填写网站或项目名称")
			return
		}
		if utf8.RuneCountInString(item.ProjectName) > 128 {
			common.ApiErrorMsg(c, "网站或项目名称过长")
			return
		}
		if item.Contact == "" {
			common.ApiErrorMsg(c, "请填写联系方式")
			return
		}
		if utf8.RuneCountInString(item.Contact) > 255 {
			common.ApiErrorMsg(c, "联系方式过长")
			return
		}
		if item.SupportType != model.CoBuildingSupportBalance &&
			item.SupportType != model.CoBuildingSupportFull &&
			item.SupportType != model.CoBuildingSupportDiscount {
			common.ApiErrorMsg(c, "请选择希望获得的支持类型")
			return
		}
		if item.Description == "" {
			common.ApiErrorMsg(c, "请填写项目介绍")
			return
		}
		if utf8.RuneCountInString(item.Description) > 2000 {
			common.ApiErrorMsg(c, "项目介绍过长")
			return
		}
		if utf8.RuneCountInString(item.Scale) > 128 {
			common.ApiErrorMsg(c, "当前规模过长")
			return
		}
		for _, link := range []string{item.Website, item.Github} {
			if link != "" && !strings.HasPrefix(link, "http://") && !strings.HasPrefix(link, "https://") {
				common.ApiErrorMsg(c, "网站地址与 GitHub 链接需以 http(s):// 开头")
				return
			}
			if utf8.RuneCountInString(link) > 512 {
				common.ApiErrorMsg(c, "链接过长")
				return
			}
		}
	default:
		common.ApiErrorMsg(c, "申请类型错误")
		return
	}

	username, err := model.GetUsernameById(userId, false)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	item.Username = username

	if err := model.CreateCoBuilding(item); err != nil {
		common.ApiError(c, err)
		return
	}

	common.ApiSuccess(c, item)
}

// GetMyCoBuildings 获取当前用户的共建计划记录
func GetMyCoBuildings(c *gin.Context) {
	userId := c.GetInt("id")
	pageInfo := common.GetPageQuery(c)

	items, total, err := model.GetUserCoBuildings(userId, pageInfo)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	pageInfo.SetTotal(int(total))
	pageInfo.SetItems(items)
	common.ApiSuccess(c, pageInfo)
}

// GetAllCoBuildings 管理员获取全平台共建计划记录
func GetAllCoBuildings(c *gin.Context) {
	pageInfo := common.GetPageQuery(c)
	keyword := c.Query("keyword")

	status := -1
	if s := c.Query("status"); s != "" {
		if v, err := strconv.Atoi(s); err == nil {
			status = v
		}
	}
	typ := 0
	if s := c.Query("type"); s != "" {
		if v, err := strconv.Atoi(s); err == nil {
			typ = v
		}
	}

	items, total, err := model.GetAllCoBuildings(pageInfo, keyword, status, typ)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	pageInfo.SetTotal(int(total))
	pageInfo.SetItems(items)
	common.ApiSuccess(c, pageInfo)
}

// ReviewCoBuilding 管理员审核共建计划记录
func ReviewCoBuilding(c *gin.Context) {
	var req ReviewCoBuildingRequest
	if err := c.ShouldBindJSON(&req); err != nil || req.Id <= 0 {
		common.ApiErrorMsg(c, "参数错误")
		return
	}

	note := strings.TrimSpace(req.Note)
	if utf8.RuneCountInString(note) > 1024 {
		common.ApiErrorMsg(c, "审核说明过长")
		return
	}

	// 通过：奖励金额（美元）须在范围内且最多两位小数，换算为内部额度
	rewardQuota := 0
	if req.Approve {
		amount := decimal.NewFromFloat(req.Amount)
		if amount.LessThan(decimal.NewFromInt(coBuildingMinRewardAmount)) ||
			amount.GreaterThan(decimal.NewFromInt(coBuildingMaxRewardAmount)) ||
			!amount.Round(2).Equal(amount) {
			common.ApiErrorMsg(c, "奖励金额需在 1 至 1000 美元之间，且最多两位小数")
			return
		}
		quota, err := common.WalletQuotaFromDecimalStrict(amount.Mul(decimal.NewFromFloat(common.QuotaPerUnit)))
		if err != nil || quota <= 0 {
			common.ApiErrorMsg(c, "奖励金额换算失败，请重试")
			return
		}
		rewardQuota = quota
	} else if note == "" {
		common.ApiErrorMsg(c, "不通过时必须填写原因")
		return
	}

	reviewerId := c.GetInt("id")
	reviewerName := c.GetString("username")

	targetUserId, err := model.ReviewCoBuilding(req.Id, req.Approve, rewardQuota, note, reviewerId, reviewerName)
	if err != nil {
		common.ApiError(c, err)
		return
	}

	result := "rejected"
	if req.Approve {
		result = "approved"
		model.RecordLog(targetUserId, model.LogTypeSystem,
			fmt.Sprintf("共建计划审核通过，获得额度 %s", logger.LogQuota(rewardQuota)))
	} else {
		model.RecordLog(targetUserId, model.LogTypeSystem,
			fmt.Sprintf("共建计划审核未通过：%s", note))
	}

	recordManageAuditFor(c, targetUserId, "cobuilding.review", map[string]interface{}{
		"id":     req.Id,
		"result": result,
		"reward": rewardQuota,
		"note":   note,
	})

	common.ApiSuccess(c, nil)
}
