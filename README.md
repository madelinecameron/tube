## AYHT API Documentation

### How to use

Get your API key from /profile and set header `x-apikey` to your API key

### Endpoints

#### /api/days (GET)
Get a list of your days

#### /api/days (POST)
Insert an answer for the current day

|argument|type|description|required|
|--------|----|-------|--------|
|answer|boolean|Whether your day was good|true|
|reason|string|What made your day good or bad|false|

#### /api/days/:id (PUT) 
Update your reason for a given day

|argument|type|description|required|
|--------|----|-------|--------|
|id|string|ID of the day to update|true|
|reason|string|What made your day good or bad|false|
