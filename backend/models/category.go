package models

import (
	"time"

	"github.com/jinzhu/gorm"
)

type Category struct {
	ID        uint       `json:"id" gorm:"primary_key"`
	Name      string     `json:"name" gorm:"not null;size:50"`
	Type      string     `json:"type" gorm:"not null;size:20"`
	Sort      int        `json:"sort" gorm:"default:0"`
	Status    int        `json:"status" gorm:"default:1"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `json:"-" sql:"index"`
}

func (Category) TableName() string {
	return "categories"
}

func GetCategoryByID(db *gorm.DB, id uint) (*Category, error) {
	var category Category
	if err := db.First(&category, id).Error; err != nil {
		return nil, err
	}
	return &category, nil
}

func CreateCategory(db *gorm.DB, category *Category) error {
	return db.Create(category).Error
}

func UpdateCategory(db *gorm.DB, category *Category) error {
	return db.Save(category).Error
}

func GetCategoryList(db *gorm.DB, cType string, page, pageSize int) ([]Category, int, error) {
	var categories []Category
	var total int

	query := db.Model(&Category{})
	if cType != "" {
		query = query.Where("type = ?", cType)
	}
	query.Count(&total)

	offset := (page - 1) * pageSize
	if err := query.Order("sort asc, created_at desc").Offset(offset).Limit(pageSize).Find(&categories).Error; err != nil {
		return nil, 0, err
	}

	return categories, total, nil
}
