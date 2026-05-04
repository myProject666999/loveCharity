package models

import (
	"time"

	"github.com/jinzhu/gorm"
)

type Notice struct {
	ID          uint       `json:"id" gorm:"primary_key"`
	Title       string     `json:"title" gorm:"not null;size:200"`
	Content     string     `json:"content" gorm:"type:text"`
	IsTop       int        `json:"is_top" gorm:"default:0"`
	Status      int        `json:"status" gorm:"default:1"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	DeletedAt   *time.Time `json:"-" sql:"index"`
}

func (Notice) TableName() string {
	return "notices"
}

func GetNoticeByID(db *gorm.DB, id uint) (*Notice, error) {
	var notice Notice
	if err := db.First(&notice, id).Error; err != nil {
		return nil, err
	}
	return &notice, nil
}

func CreateNotice(db *gorm.DB, notice *Notice) error {
	return db.Create(notice).Error
}

func UpdateNotice(db *gorm.DB, notice *Notice) error {
	return db.Save(notice).Error
}

func GetNoticeList(db *gorm.DB, isTop int, page, pageSize int) ([]Notice, int, error) {
	var notices []Notice
	var total int

	query := db.Model(&Notice{})
	if isTop == 1 {
		query = query.Where("is_top = ?", 1)
	}
	query.Count(&total)

	offset := (page - 1) * pageSize
	if err := query.Order("is_top desc, created_at desc").Offset(offset).Limit(pageSize).Find(&notices).Error; err != nil {
		return nil, 0, err
	}

	return notices, total, nil
}
