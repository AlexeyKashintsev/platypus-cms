/**
 *
 * @author admin
 * @name qGetTemplateWidgetList
 * @public 
 */ 
Select * 
From page_widgets t1
 Where :aTemplateId = t1.template_id