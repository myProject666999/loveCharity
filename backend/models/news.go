package models

import (
	"time"

	"github.com/jinzhu/gorm"
)

type News struct {
	ID          uint       `json:"id" gorm:"primary_key"`
	Title       string     `json:"title" gorm:"not null;size:200"`
	CategoryID  uint       `json:"category_id"`
	Content     string     `json:"content" gorm:"type:text"`
	Cover       string     `json:"cover" gorm:"size:255"`
	Description string     `json:"description" gorm:"size:500"`
	Author      string     `json:"author" gorm:"size:50"`
	Views       int        `json:"views" gorm:"default:0"`
	Status      int        `json:"status" gorm:"default:1"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	DeletedAt   *time.Time `json:"-" sql:"index"`
}

func (News) TableName() string {
	return "news"
}

func GetNewsByID(db *gorm.DB, id uint) (*News, error) {
	var news News
	if err := db.First(&news, id).Error; err != nil {
		return nil, err
	}
	return &news, nil
}

func CreateNews(db *gorm.DB, news *News) error {
	return db.Create(news).Error
}

func UpdateNews(db *gorm.DB, news *News) error {
	return db.Save(news).Error
}

func GetNewsList(db *gorm.DB, categoryID uint, keyword string, page, pageSize int) ([]News, int, error) {
	var newsList []News
	var total int

	query := db.Model(&News{})
	if categoryID > 0 {
		query = query.Where("category_id = ?", categoryID)
	}
	if keyword != "" {
		query = query.Where("title LIKE ? OR content LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
	}
	query.Count(&total)

	offset := (page - 1) * pageSize
	if err := query.Order("created_at desc").Offset(offset).Limit(pageSize).Find(&newsList).Error; err != nil {
		return nil, 0, err
	}

	return newsList, total, nil
}

func IncreaseViews(db *gorm.DB, id uint) error {
	return db.Model(&News{}).Where("id = ?", id).UpdateColumn("views", gorm.Expr("views + 1")).Error
}
