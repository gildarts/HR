class CpContributeAddEstimate < ActiveRecord::Migration
  def change
  	change_table(:cp_contribute, :bulk => true) do |t|
	  t.integer "estimate"
	end
  end
end
