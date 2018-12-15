#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>
#include <ESP8266WebServer.h>
#define PIR 13
#define LAMP  4
const int LAMP1 = D3;

const char* ssid = "HK";
const char* password = "harshketa";

String isRegistered = "false";
String localIP = "";
String macAddress = "";
String masterURL = "http://192.168.0.50:3000";
int httpCode = 200;
ESP8266WebServer server(80);
int prevPIRState = 0;
int active = 0;

void setup () {

  Serial.begin(115200);
  WiFi.begin(ssid, password);

  pinMode(LAMP, OUTPUT);
  pinMode(LAMP1, OUTPUT);
  pinMode(PIR, INPUT);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print("Connecting..\n");
  }

  server.on("/masterStart", masterStart);
  server.begin();
}

void loop() {

  if (WiFi.status() == WL_CONNECTED && httpCode == 200) { //Check WiFi connection status
    if ( isRegistered == "false") {
      Serial.print("Connected..  " + isRegistered);
      isRegistered = "true";
      macAddress = WiFi.macAddress();
      localIP = WiFi.localIP().toString();

      Serial.print("\n macAddress : " + macAddress);
      Serial.print("\n localIP : " + localIP);
      Serial.print( "\n");

      if (httpCode == 200) {
        String requestQuery =  "mac_gpio=PIR-" + macAddress + "-" + PIR + "&ip=" + localIP + "&state=LOW";
        HTTPClient http;
        http.begin(masterURL + "/slave/new?" + requestQuery); //Specify request destination
        httpCode = http.GET();
        Serial.print( "*************************************************************\n");
        Serial.print(httpCode);
        Serial.print("\n");
      }
    }

    int value_pir = digitalRead(PIR); // read input value

    Serial.println(value_pir);
    if (value_pir == 1) {
      active = active + 1;
    } else {
      active = 0;
    }

    if (active == 10) {
      active = 0;
      sendRequest(PIR, "HIGH");
      Serial.println("HIGH.....\n");
    }

    if (prevPIRState != value_pir) {
      if ((value_pir == 1) || (prevPIRState == 1 && value_pir == 0)) {
        sendRequest(PIR, "HIGH");
        Serial.println("HIGH.....\n");
      } else {
        Serial.println("LOW.....\n");
        active = 0;
      }
      prevPIRState = value_pir;
    }
  }

  delay(1000);
  server.handleClient();
}

void sendRequest(int pin, String state) {
  String requestQuery =  "mac_gpio=PIR-" + macAddress + "-" + pin + "&ip=" + localIP + "&state=" + state;
  HTTPClient http;
  http.begin(masterURL + "/slave/request?" + requestQuery); //Specify request destination
  httpCode = http.GET();
}

void masterStart() {
  httpCode = 200;
  server.send(200, "text/plain", "masterStart is done :-)");
}
