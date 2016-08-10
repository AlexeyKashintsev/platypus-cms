/**
 * 
 * @author admin
 * @name qGetPageInfoViaId
 * @public
 */
Select *
from page t
where :aPageId = t.page_id