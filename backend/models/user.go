package models

import (
	"time"

	"github.com/jinzhu/gorm"
)

type User struct {
	ID          uint       `json:"id" gorm:"primary_key"`
	Username    string     `json:"username" gorm:"unique_index;not null;size:50"`
	Password    string     `json:"-" gorm:"not null;size:255"`
	Email       string     `json:"email" gorm:"size:100"`
	Phone       string     `json:"phone" gorm:"size:20"`
	Avatar      string     `json:"avatar" gorm:"size:255"`
	Nickname    string     `json:"nickname" gorm:"size:50"`
	Gender      int        `json:"gender" gorm:"default:0"`
	Status      int        `json:"status" gorm:"default:1"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	DeletedAt   *time.Time `json:"-" sql:"index"`
}

func (User) TableName() string {
	return "users"
}

func GetUserByID(db *gorm.DB, id uint) (*User, error) {
	var user User
	if err := db.First(&user, id).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func GetUserByUsername(db *gorm.DB, username string) (*User, error) {
	var user User
	if err := db.Where("username = ?", username).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func CreateUser(db *gorm.DB, user *User) error {
	return db.Create(user).Error
}

func UpdateUser(db *gorm.DB, user *User) error {
	return db.Save(user).Error
}

func GetUserList(db *gorm.DB, page, pageSize int) ([]User, int, error) {
	var users []User
	var total int

	query := db.Model(&User{})
	query.Count(&total)

	offset := (page - 1) * pageSize
	if err := query.Order("created_at desc").Offset(offset).Limit(pageSize).Find(&users).Error; err != nil {
		return nil, 0, err
	}

	return users, total, nil
}
