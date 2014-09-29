<?php
class Tag extends AppModel {
    public $name = 'Tag';
    public $useTable = 'tags';
	
	public $hasAndBelongsToMany = array(
	'Event' => array(
		'className' => 'Event',
		'joinTable' => 'activities_tags',
		'foreignKey' => 'tags_id',
		'associationForeignKey' => 'activities_id', 
		'unique' => false
		)
	);
}
	