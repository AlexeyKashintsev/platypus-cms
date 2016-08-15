/**
 *
 * @author admin
 * @name qGetWidgetInfo
 * @public 
 */ 
Select t1.widget_id, t1.name, t1.author, t1.description, t1.layout, t.data_value, t.data_name
From widget t1
 Inner Join widget_data t on t.widget_id = t1.widget_id
 Where :aWidgetId = t1.widget_id