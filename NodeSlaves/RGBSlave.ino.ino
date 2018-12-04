#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>
#include <ESP8266WebServer.h>

const char* ssid = "HK";
const char* password = "harshketa";

int delayTime = 20;
int redPin = 5;
int greenPin = 4;
int bluePin = 0;
int sound = 12;

int R = 0;
int G = 0;
int B = 0;

boolean receiveSingleColorRequest = false;
boolean receiveAutoColorModeRequest = false;
boolean receiveMusicalModeRequest = false;

String isRegistered = "false";
String localIP = "";
String macAddress = "";
String masterURL = "http://192.168.0.50:3000";
int httpCode = 200;
ESP8266WebServer server(80);

void setup () {

  Serial.begin(115200);
  pinMode(redPin, OUTPUT);
  pinMode(greenPin, OUTPUT);
  pinMode(bluePin, OUTPUT);
  pinMode(sound, INPUT);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print("Connecting..\n");
  }

  server.on("/receiveSingleColorRequest", receiveSingleColorRequestMethod);
  server.on("/receiveAutoColorModeRequest", receiveAutoColorModeRequestMethod);
  server.on("/receiveMusicalModeRequest", receiveMusicalModeRequestMethod);
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
        String requestQuery =  "mac_gpio=RGB-" + macAddress + "&ip=" + localIP;
        HTTPClient http;
        http.begin(masterURL + "/slave/new?" + requestQuery); //Specify request destination
        httpCode = http.GET();
        Serial.print( "*************************************************************\n");
        Serial.print(httpCode);
        Serial.print("\n");
      }
    }
  }
  server.handleClient();

  if (receiveMusicalModeRequest) {
    int soundstate = digitalRead(sound);
    if (soundstate == 1) {
      if (R != 0 || G != 0 || B != 0) {
        setColor(R, G, B);
      } else {
        setColor(random(0, 255), random(0, 255), random(0, 255));
      }
    } else {
      setColor(0, 0, 0);
    }
  }

  if (receiveSingleColorRequest) {
    setColor(R, G, B);
  }

  if (receiveAutoColorModeRequest) {
    int redVal = 255;
    int blueVal = 0;
    int greenVal = 0;

    for ( int i = 0 ; i < 255 ; i += 1 ) {
      if (!receiveAutoColorModeRequest) {
        break;
      } else {
        greenVal += 1;
        redVal -= 1;
        analogWrite( greenPin, 255 - greenVal );
        analogWrite( redPin, 255 - redVal );
        delay( delayTime );
      }
    }

    redVal = 0;
    blueVal = 0;
    greenVal = 255;

    for ( int i = 0 ; i < 255 ; i += 1 ) {
      if (!receiveAutoColorModeRequest) {
        break;
      } else {
        blueVal += 1;
        greenVal -= 1;
        analogWrite( bluePin, 255 - blueVal );
        analogWrite( greenPin, 255 - greenVal );
        delay( delayTime );
      }
    }

    redVal = 0;
    blueVal = 255;
    greenVal = 0;

    for ( int i = 0 ; i < 255 ; i += 1 ) {
      if (!receiveAutoColorModeRequest) {
        break;
      } else {
        redVal += 1;
        blueVal -= 1;
        analogWrite( redPin, 255 - redVal );
        analogWrite( bluePin, 255 - blueVal );
        delay( delayTime );
      }
    }
  }

}

void receiveSingleColorRequestMethod() {
  R = server.arg("R").toInt();
  G = server.arg("G").toInt();
  B = server.arg("B").toInt();

  if (server.arg("state") == "HIGH") {
    receiveSingleColorRequest = true;
  } else {
    receiveSingleColorRequest = false;
    R = 0;
    G = 0;
    B = 0;
    setColor(0, 0, 0);
  }
  receiveAutoColorModeRequest = false;
  receiveMusicalModeRequest = false;
  server.send(200, "text/plain", "receiveSingleColorRequestMethod is done :-)");
}

void receiveAutoColorModeRequestMethod() {
  if (server.arg("state") == "HIGH") {
    receiveAutoColorModeRequest = true;
  } else {
    receiveAutoColorModeRequest = false;
    setColor(0, 0, 0);
  }
  receiveSingleColorRequest = false;
  receiveMusicalModeRequest = false;
  server.send(200, "text/plain", "receiveAutoColorModeRequestMethod is done :-)");
}

void receiveMusicalModeRequestMethod() {
  R = server.arg("R").toInt();
  G = server.arg("G").toInt();
  B = server.arg("B").toInt();

  if (server.arg("state") == "HIGH") {
    receiveMusicalModeRequest = true;
  } else {
    receiveMusicalModeRequest = false;
    R = 0;
    G = 0;
    B = 0;
    setColor(0, 0, 0);
  }
  receiveSingleColorRequest = false;
  receiveAutoColorModeRequest = false;
  server.send(200, "text/plain", "receiveMusicalModeRequestMethod is done :-)");
}

void setColor(int redValue, int greenValue, int blueValue) {
  analogWrite(redPin, redValue);
  analogWrite(greenPin, greenValue);
  analogWrite(bluePin, blueValue);
}

void masterStart() {
  httpCode = 200;
  server.send(200, "text/plain", "masterStart is done :-)");
}



