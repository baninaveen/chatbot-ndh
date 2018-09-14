curl -X POST -H "Content-Type: application/json" -d '{
    "recipient":{
      "id":"1920660704714596"
    },
    "message":{
      "text":"hello, world!"
    }
  }' "https://graph.facebook.com/v2.6/me/messages?access_token=EAAJuXoIWsTgBANi44kMDcuTrPsy271nD5ZAZAX268kw6x0cjxqHTW5aicDsUTc4HpZCfsEoSGZAyi106RPnOkDtCs4lfE74rb3IX5roIgvZCPsf5gh75VNvVOVCK7eGv0bToRZBPSAJNGiBGtT3ygAxMVgUyzVCMXPZAcZA60Dgy8gZDZD"
      