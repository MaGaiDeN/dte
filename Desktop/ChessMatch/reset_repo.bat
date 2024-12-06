@echo off
echo Limpiando el repositorio...

rem Eliminar todos los archivos excepto los necesarios
for /d %%i in (*) do if not "%%i"=="node_modules" if not "%%i"==".git" rd /s /q "%%i"
for %%i in (*) do if not "%%i"=="package.json" if not "%%i"=="package-lock.json" if not "%%i"=="reset_repo.bat" del "%%i"

rem Inicializar el repositorio nuevamente
git rm -rf --cached .
git add .
git commit -m "Reset repository for fresh start"
git push origin main --force

echo Repositorio limpiado correctamente.
echo Ahora puedes comenzar a agregar los nuevos archivos.
pause
