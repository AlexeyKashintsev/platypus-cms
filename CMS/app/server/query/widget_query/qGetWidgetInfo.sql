/**
 *
 * @author admin
 * @name qGetWidgetInfo
 * @public 
 */ 
Select t.widget_id
From widget t1
 Inner Join widget_data t on t.widget_id = t1.widget_id
 Where :aWidgetId = t1.widget_id