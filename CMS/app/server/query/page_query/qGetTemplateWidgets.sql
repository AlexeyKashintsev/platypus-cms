/**
 *
 * @author admin
 * @name qGetTemplateWidgets
 * @public 
 */ 
Select t.widget_id, t.name ,t.layout, t2.data_value, t2.data_name 
From page_widgets t1
 Inner Join widget t on t.widget_id = t1.widget_id
 Inner Join widget_data t2 on t2.widget_id = t.widget_id
 Where :aTemplateId = t1.template_id