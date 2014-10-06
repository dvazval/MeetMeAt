<?php
class Event extends AppModel {
    public $name = 'Event';
    public $useTable = 'events';
	
	public $hasAndBelongsToMany = array(
	'User' => array(
		'className' => 'User',
		'joinTable' => 'users_events',
		'foreignKey' => 'events_id',
		'associationForeignKey' => 'users_id', 
		'unique' => false
		),
		
	'Activity' => array(
		'className' => 'Activity',
		'joinTable' => 'events_activities',
		'foreignKey' => 'events_id',
		'associationForeignKey' => 'activities_id',  
		'unique' => false
		)
	);
}