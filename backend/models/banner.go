package models

import (
	"time"

	"github.com/jinzhu/gorm"
)

type Banner struct {
	ID        uint       `json:"id" gorm:"primary_key"`
	Title     string     `json:"title" gorm:"size:200"`
	Image     string     `json:"image" gorm:"not null;size:255"`
	Link      string     `json:"link" gorm:"size:255"`
	Sort      int        `json:"sort" gorm:"default:0"`
	Status    int        `json:"status" gorm:"default:1"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `json:"-" sql:"index"`
}

func (Banner) TableName() string {
	return "banners"
}

func GetBannerByID(db *gorm.DB, id uint) (*Banner, error) {
	var banner Banner
	if err := db.First(&banner, id).Error; err != nil {
		return nil, err
	}
	return &banner, nil
}

func CreateBanner(db *gorm.DB, banner *Banner) error {
	return db.Create(banner).Error
}

func UpdateBanner(db *gorm.DB, banner *Banner) error {
	return db.Save(banner).Error
}

func GetBannerList(db *gorm.DB, status int, page, pageSize int) ([]Banner, int, error) {
	var banners []Banner
	var total int

	query := db.Model(&Banner{})
	if status == 1 {
		query = query.Where("status = ?", 1)
	}
	query.Count(&total)

	offset := (page - 1) * pageSize
	if err := query.Order("sort asc, created_at desc").Offset(offset).Limit(pageSize).Find(&banners).Error; err != nil {
		return nil, 0, err
	}

	return banners, total, nil
}
