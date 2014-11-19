# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 0) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "contributor", force: true do |t|
    t.string   "name",                 limit: 150,             null: false
    t.string   "user_id",              limit: 250
    t.integer  "unit_cost",                        default: 0
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "google_refresh_token", limit: 200
  end

  add_index "contributor", ["user_id"], name: "contributor_user_id_key", unique: true, using: :btree

  create_table "cp_contribute", force: true do |t|
    t.integer  "ref_project_id"
    t.integer  "ref_contributor_id"
    t.date     "date",               null: false
    t.integer  "amount"
    t.text     "description",        null: false
    t.datetime "created_at"
    t.datetime "update_at"
    t.time     "start_time"
  end

  create_table "project", force: true do |t|
    t.integer  "ref_contributor_id"
    t.string   "name",               limit: 300,  null: false
    t.string   "description",        limit: 3000
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "ref_category_id"
  end

  create_table "project_category", force: true do |t|
    t.string   "name",        limit: nil
    t.string   "description", limit: nil
    t.datetime "created_at"
    t.datetime "updated_at"
  end

end
