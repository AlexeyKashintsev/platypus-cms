/**
 * 
 * @author admin
 * @name qGetPageWidgets
 * @public
 */ 
Select t4.name
From page t
 Inner Join template t1 on t.template_id = t1.template_id
 Inner Join template t2 on t1.template_id = t2.root_template
 Inner Join page_widgets t3 on t2.template_id = t3.template_id
 Inner Join widget t4 on t4.widget_id = t3.widget_id
 Inner Join widget_data t5 on t5.widget_id = t4.widget_id
 Where :aPageId = t.page_id