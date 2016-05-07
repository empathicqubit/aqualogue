echo ^<html^>^<body^> > index.html
dir *.js /s /b > tmpfile
for /F "tokens=*" %%A in (tmpfile) do (
	echo ^<script type="text/javascript" src="file:///%%A"^>^</script^> >> index.html
)
echo ^</body^>^</html^> >> index.html