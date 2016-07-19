# Routes help

Route to work, you need to deploy to the ROOT context of a blank web application 

In the folder **WEB-INF**, create a file **rewrite.config** with the following content

```
RewriteCond %{REQUEST_URI} !^.*\.(bmp|css|gif|htc|ico|jpe?g|js|pdf|png|swf|txt|xml|svg|eot|woff|woff2|ttf)$
RewriteRule ^/(.*) /cms/application/router/$1  [L]

RewriteCond %{REQUEST_URI} ^.*\.(bmp|css|gif|htc|ico|jpe?g|js|pdf|png|swf|txt|xml|svg|eot|woff|woff2|ttf)$
RewriteRule ^/(.*) /cms/static/$1  [L]
```

and file **context.xml** in **META-INF** folder

```xml
<?xml version='1.0' encoding='utf-8'?>
<Context docBase="ROOT" path="/" reloadable="true" crossContext="true">
    <Valve className="org.apache.catalina.valves.rewrite.RewriteValve"/>
</Context>
```