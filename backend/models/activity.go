package models

import (
	"time"

	"github.com/jinzhu/gorm"
)

type Activity struct {
	ID          uint       `json:"id" gorm:"primary_key"`
	Title       string     `json:"title" gorm:"not null;size:200"`
	CategoryID  uint       `json:"category_id"`
	Content     string     `json:"content" gorm:"type:text"`
	Cover       string     `json:"cover" gorm:"size:255"`
	Location    string     `json:"location" gorm:"size:200"`
	StartTime   time.Time  `json:"start_time"`
	EndTime     time.Time  `json:"end_time"`
	MaxPeople   int        `json:"max_people" gorm:"default:0"`
	JoinedCount int        `json:"joined_count" gorm:"default:0"`
	Status      int        `json:"status" gorm:"default:1"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	DeletedAt   *time.Time `json:"-" sql:"index"`
}

type ActivityApply struct {
	ID         uint       `json:"id" gorm:"primary_key"`
	ActivityID uint       `json:"activity_id"`
	UserID     uint       `json:"user_id"`
	Name       string     `json:"name" gorm:"size:50"`
	Phone      string     `json:"phone" gorm:"size:20"`
	Reason     string     `json:"reason" gorm:"size:500"`
	Status     int        `json:"status" gorm:"default:0"`
	Remark     string     `json:"remark" gorm:"size:500"`
	CreatedAt  time.Time  `json:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at"`
	DeletedAt  *time.Time `json:"-" sql:"index"`
}

func (Activity) TableName() string {
	return "activities"
}

func (ActivityApply) TableName() string {
	return "activity_applies"
}

func GetActivityByID(db *gorm.DB, id uint) (*Activity, error) {
	var activity Activity
	if err := db.First(&activity, id).Error; err != nil {
		return nil, err
	}
	return &activity, nil
}

func CreateActivity(db *gorm.DB, activity *Activity) error {
	return db.Create(activity).Error
}

func UpdateActivity(db *gorm.DB, activity *Activity) error {
	return db.Save(activity).Error
}

func GetActivityList(db *gorm.DB, categoryID uint, status int, page, pageSize int) ([]Activity, int, error) {
	var activities []Activity
	var total int

	query := db.Model(&Activity{})
	if categoryID > 0 {
		query = query.Where("category_id = ?", categoryID)
	}
	if status >= 0 {
		query = query.Where("status = ?", status)
	}
	query.Count(&total)

	offset := (page - 1) * pageSize
	if err := query.Order("created_at desc").Offset(offset).Limit(pageSize).Find(&activities).Error; err != nil {
		return nil, 0, err
	}

	return activities, total, nil
}

func CreateActivityApply(db *gorm.DB, apply *ActivityApply) error {
	return db.Create(apply).Error
}

func GetActivityApplyByID(db *gorm.DB, id uint) (*ActivityApply, error) {
	var apply ActivityApply
	if err := db.First(&apply, id).Error; err != nil {
		return nil, err
	}
	return &apply, nil
}

func GetActivityApplyByUserAndActivity(db *gorm.DB, userID, activityID uint) (*ActivityApply, error) {
	var apply ActivityApply
	if err := db.Where("user_id = ? AND activity_id = ?", userID, activityID).First(&apply).Error; err != nil {
		return nil, err
	}
	return &apply, nil
}

func UpdateActivityApply(db *gorm.DB, apply *ActivityApply) error {
	return db.Save(apply).Error
}

func GetActivityApplyList(db *gorm.DB, activityID uint, userID uint, status int, page, pageSize int) ([]ActivityApply, int, error) {
	var applies []ActivityApply
	var total int

	query := db.Model(&ActivityApply{})
	if activityID > 0 {
		query = query.Where("activity_id = ?", activityID)
	}
	if userID > 0 {
		query = query.Where("user_id = ?", userID)
	}
	if status >= 0 {
		query = query.Where("status = ?", status)
	}
	query.Count(&total)

	offset := (page - 1) * pageSize
	if err := query.Order("created_at desc").Offset(offset).Limit(pageSize).Find(&applies).Error; err != nil {
		return nil, 0, err
	}

	return applies, total, nil
}

func IncreaseJoinedCount(db *gorm.DB, activityID uint) error {
	return db.Model(&Activity{}).Where("id = ?", activityID).UpdateColumn("joined_count", gorm.Expr("joined_count + 1")).Error
}
