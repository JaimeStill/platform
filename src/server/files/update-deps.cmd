@echo off

echo Updating dbseeder dependencies...
cd .\dbseeder
call dotnet add package Microsoft.EntityFrameworkCore.Relational
call dotnet add package Microsoft.EntityFrameworkCore.SqlServer

echo Updating <%= classify(name) %>.Core dependencies...
cd ..\<%= classify(name) %>.Core
call dotnet add package Microsoft.EntityFrameworkCore

echo Updating <%= classify(name) %>.Data dependencies...
cd ..\<%= classify(name) %>.Data
call dotnet add package Microsoft.EntityFrameworkCore.SqlServer
call dotnet add package Microsoft.EntityFrameworkCore.Tools

echo Updating <%= classify(name) %>.Office dependencies...
cd ..\<%= classify(name) %>.Office
call dotnet add package DocumentFormat.OpenXml

echo Updating <%= classify(name) %>.Sql dependencies...
cd ..\<%= classify(name) %>.Sql
call dotnet add package Microsoft.Data.SqlClient
call dotnet add package Newtonsoft.Json

echo Updating <%= classify(name) %>.Web dependencies...
cd ..\<%= classify(name) %>.Web
call dotnet add package Microsoft.AspNetCore.Mvc.NewtonsoftJson
call dotnet add package Microsoft.EntityFrameworkCore.Design

cd ..
echo Dependencies successfully updated!
