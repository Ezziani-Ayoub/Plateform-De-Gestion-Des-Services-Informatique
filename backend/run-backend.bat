@echo off
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-25.0.2.10-hotspot"
set PATH=%JAVA_HOME%\bin;%PATH%
cd /d "%~dp0"
echo [PGSI] JAVA_HOME = %JAVA_HOME%
echo [PGSI] Starting backend...
mvn spring-boot:run

