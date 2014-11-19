class CpContributeAddTitle < ActiveRecord::Migration
  def change
  	change_table(:cp_contribute, :bulk => true) do |t|
	   t.string   "title",              limit: 250
	end
  end
end
