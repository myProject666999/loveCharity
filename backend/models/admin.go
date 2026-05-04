package models

import (
	"time"

	"github.com/jinzhu/gorm"
)

type Admin struct {
	ID        uint       `json:"id" gorm:"primary_key"`
	Username  string     `json:"username" gorm:"unique_index;not null;size:50"`
	Password  string     `json:"-" gorm:"not null;size:255"`
	Nickname  string     `json:"nickname" gorm:"size:50"`
	Role      string     `json:"role" gorm:"default:'admin'"`
	Status    int        `json:"status" gorm:"default:1"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `json:"-" sql:"index"`
}

func (Admin) TableName() string {
	return "admins"
}

func GetAdminByID(db *gorm.DB, id uint) (*Admin, error) {
	var admin Admin
	if err := db.First(&admin, id).Error; err != nil {
		return nil, err
	}
	return &admin, nil
}

func GetAdminByUsername(db *gorm.DB, username string) (*Admin, error) {
	var admin Admin
	if err := db.Where("username = ?", username).First(&admin).Error; err != nil {
		return nil, err
	}
	return &admin, nil
}

func CreateAdmin(db *gorm.DB, admin *Admin) error {
	return db.Create(admin).Error
}

func UpdateAdmin(db *gorm.DB, admin *Admin) error {
	return db.Save(admin).Error
}

func GetAdminList(db *gorm.DB, page, pageSize int) ([]Admin, int, error) {
	var admins []Admin
	var total int

	query := db.Model(&Admin{})
	query.Count(&total)

	offset := (page - 1) * pageSize
	if err := query.Order("created_at desc").Offset(offset).Limit(pageSize).Find(&admins).Error; err != nil {
		return nil, 0, err
	}

	return admins, total, nil
}
