package models

import (
	"time"

	"github.com/jinzhu/gorm"
)

type Forum struct {
	ID          uint       `json:"id" gorm:"primary_key"`
	UserID      uint       `json:"user_id"`
	CategoryID  uint       `json:"category_id"`
	Title       string     `json:"title" gorm:"not null;size:200"`
	Content     string     `json:"content" gorm:"type:text"`
	Cover       string     `json:"cover" gorm:"size:255"`
	Views       int        `json:"views" gorm:"default:0"`
	Comments    int        `json:"comments" gorm:"default:0"`
	Status      int        `json:"status" gorm:"default:1"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	DeletedAt   *time.Time `json:"-" sql:"index"`
}

type ForumComment struct {
	ID        uint       `json:"id" gorm:"primary_key"`
	ForumID   uint       `json:"forum_id"`
	UserID    uint       `json:"user_id"`
	Content   string     `json:"content" gorm:"not null;size:500"`
	ParentID  uint       `json:"parent_id" gorm:"default:0"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `json:"-" sql:"index"`
}

func (Forum) TableName() string {
	return "forums"
}

func (ForumComment) TableName() string {
	return "forum_comments"
}

func GetForumByID(db *gorm.DB, id uint) (*Forum, error) {
	var forum Forum
	if err := db.First(&forum, id).Error; err != nil {
		return nil, err
	}
	return &forum, nil
}

func CreateForum(db *gorm.DB, forum *Forum) error {
	return db.Create(forum).Error
}

func UpdateForum(db *gorm.DB, forum *Forum) error {
	return db.Save(forum).Error
}

func GetForumList(db *gorm.DB, userID uint, categoryID uint, keyword string, page, pageSize int) ([]Forum, int, error) {
	var forums []Forum
	var total int

	query := db.Model(&Forum{})
	if userID > 0 {
		query = query.Where("user_id = ?", userID)
	}
	if categoryID > 0 {
		query = query.Where("category_id = ?", categoryID)
	}
	if keyword != "" {
		query = query.Where("title LIKE ? OR content LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
	}
	query = query.Where("status = ?", 1)
	query.Count(&total)

	offset := (page - 1) * pageSize
	if err := query.Order("created_at desc").Offset(offset).Limit(pageSize).Find(&forums).Error; err != nil {
		return nil, 0, err
	}

	return forums, total, nil
}

func CreateForumComment(db *gorm.DB, comment *ForumComment) error {
	return db.Create(comment).Error
}

func GetForumCommentList(db *gorm.DB, forumID uint, page, pageSize int) ([]ForumComment, int, error) {
	var comments []ForumComment
	var total int

	query := db.Model(&ForumComment{}).Where("forum_id = ?", forumID)
	query.Count(&total)

	offset := (page - 1) * pageSize
	if err := query.Order("created_at desc").Offset(offset).Limit(pageSize).Find(&comments).Error; err != nil {
		return nil, 0, err
	}

	return comments, total, nil
}

func IncreaseForumViews(db *gorm.DB, id uint) error {
	return db.Model(&Forum{}).Where("id = ?", id).UpdateColumn("views", gorm.Expr("views + 1")).Error
}

func IncreaseForumComments(db *gorm.DB, id uint) error {
	return db.Model(&Forum{}).Where("id = ?", id).UpdateColumn("comments", gorm.Expr("comments + 1")).Error
}
