/**
 * 
 * @author admin
 * @name qGetPagesTemplateInfo
 * @public
 */ 
Select t.page_id, t1.layout as root_layout, t2.template_name, t2.layout, t2.template_id, t1.root_template, t1.styles
From page t
 Inner Join template t1 on t.template_id = t1.template_id
 Inner Join template t2 on t1.template_id = t2.root_template
 Where :aPageId = t.page_id