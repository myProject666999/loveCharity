package models

import (
	"time"

	"github.com/jinzhu/gorm"
)

type Message struct {
	ID        uint       `json:"id" gorm:"primary_key"`
	UserID    uint       `json:"user_id"`
	Name      string     `json:"name" gorm:"size:50"`
	Phone     string     `json:"phone" gorm:"size:20"`
	Email     string     `json:"email" gorm:"size:100"`
	Content   string     `json:"content" gorm:"not null;size:1000"`
	Reply     string     `json:"reply" gorm:"size:1000"`
	Status    int        `json:"status" gorm:"default:0"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `json:"-" sql:"index"`
}

func (Message) TableName() string {
	return "messages"
}

func GetMessageByID(db *gorm.DB, id uint) (*Message, error) {
	var message Message
	if err := db.First(&message, id).Error; err != nil {
		return nil, err
	}
	return &message, nil
}

func CreateMessage(db *gorm.DB, message *Message) error {
	return db.Create(message).Error
}

func UpdateMessage(db *gorm.DB, message *Message) error {
	return db.Save(message).Error
}

func GetMessageList(db *gorm.DB, userID uint, status int, page, pageSize int) ([]Message, int, error) {
	var messages []Message
	var total int

	query := db.Model(&Message{})
	if userID > 0 {
		query = query.Where("user_id = ?", userID)
	}
	if status >= 0 {
		query = query.Where("status = ?", status)
	}
	query.Count(&total)

	offset := (page - 1) * pageSize
	if err := query.Order("created_at desc").Offset(offset).Limit(pageSize).Find(&messages).Error; err != nil {
		return nil, 0, err
	}

	return messages, total, nil
}
