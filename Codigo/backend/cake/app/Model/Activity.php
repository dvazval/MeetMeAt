<?php
class Activity extends AppModel {
	public $name = 'Activity';
    public $useTable = 'activities';
	
	public $hasAndBelongsToMany = array(
	'Event' => array(
		'className' => 'Event',
		'joinTable' => 'events_activities',
		'foreignKey' => 'activity_id',
		'associationForeignKey' => 'event_id', 
		'unique' => false
		),
	'Tag' => array(
		'className' => 'Tag',
		'joinTable' => 'activities_tags',
		'foreignKey' => 'activity_id',
		'associationForeignKey' => 'tag_id', 
		'unique' => false
		)
	);
}