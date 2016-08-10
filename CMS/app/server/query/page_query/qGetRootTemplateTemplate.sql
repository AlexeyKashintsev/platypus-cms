/**
 *
 * @author admin
 * @name qGetRootTemplateTemplate
 * @public 
 */ 
Select t.template_name, t1.name, t1.layout
From root_template_template t
 Inner Join root_template t1 on t.root_template_id = t1.root_template_id
 Where :aName = t1.name