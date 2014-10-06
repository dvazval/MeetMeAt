<?php
class Activity extends AppModel {
	public $name = 'Activity';
    public $useTable = 'activities';
	
	public $hasAndBelongsToMany = array(
	'Event' => array(
		'className' => 'Event',
		'joinTable' => 'events_activities',
		'foreignKey' => 'activities_id',
		'associationForeignKey' => 'events_id', 
		'unique' => false
		),
	'Tag' => array(
		'className' => 'Tag',
		'joinTable' => 'activities_tags',
		'foreignKey' => 'activities_id', 
		'associationForeignKey' => 'tags_id', 
		'unique' => false
		)
	);
}