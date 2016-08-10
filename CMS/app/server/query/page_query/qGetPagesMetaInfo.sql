/**
 * 
 * @author admin
 * @name qGetPagesMetaInfo
 * @public
 */
Select t2.*
From page t
 Inner Join meta_inf t2 on t2.page_id = t.page_id
 Where :aPageId = t.page_id