import uvicorn

if __name__ == "__main__":
    print("Starting Pyanm on http://127.0.0.1:8000...")
    print("Dashboard: http://127.0.0.1:8000/dashboard")
    print("API Docs:  http://127.0.0.1:8000/docs")
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)

