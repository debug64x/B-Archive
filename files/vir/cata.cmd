@echo off
for /l %%i in (0,1,10) do (
    mkdir "cata %%i"
    cd "cata %%i"
    echo "./cata" > cata.cmd
    cd ..
)
pause


mkdir cata
cd cata