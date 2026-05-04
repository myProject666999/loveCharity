package models

import (
	"time"

	"github.com/jinzhu/gorm"
)

type Favorite struct {
	ID        uint       `json:"id" gorm:"primary_key"`
	UserID    uint       `json:"user_id"`
	Type      string     `json:"type" gorm:"not null;size:20"`
	TargetID  uint       `json:"target_id"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `json:"-" sql:"index"`
}

func (Favorite) TableName() string {
	return "favorites"
}

func CreateFavorite(db *gorm.DB, favorite *Favorite) error {
	return db.Create(favorite).Error
}

func DeleteFavorite(db *gorm.DB, userID uint, fType string, targetID uint) error {
	return db.Where("user_id = ? AND type = ? AND target_id = ?", userID, fType, targetID).Delete(&Favorite{}).Error
}

func IsFavorited(db *gorm.DB, userID uint, fType string, targetID uint) (bool, error) {
	var count int
	err := db.Model(&Favorite{}).Where("user_id = ? AND type = ? AND target_id = ?", userID, fType, targetID).Count(&count).Error
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

func GetFavoriteList(db *gorm.DB, userID uint, fType string, page, pageSize int) ([]Favorite, int, error) {
	var favorites []Favorite
	var total int

	query := db.Model(&Favorite{}).Where("user_id = ?", userID)
	if fType != "" {
		query = query.Where("type = ?", fType)
	}
	query.Count(&total)

	offset := (page - 1) * pageSize
	if err := query.Order("created_at desc").Offset(offset).Limit(pageSize).Find(&favorites).Error; err != nil {
		return nil, 0, err
	}

	return favorites, total, nil
}
