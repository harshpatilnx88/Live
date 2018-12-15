#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>
#include <ESP8266WebServer.h>

const char* ssid = "HK";
const char* password = "harshketa";

const int zero_crossing_d2 = 4;

const int pins[] = {15};
const int buttons[] = {13};
int buttonsState[] = {0};
int freeze[] = {false};
int resp[] = { -1};
String isRegistered = "false";
String localIP = "";
String macAddress = "";
String masterURL = "http://192.168.0.50:3000";
int httpCode = 200;
ESP8266WebServer server(80);

int dimming = 5;

void setup () {

  Serial.begin(115200);
  WiFi.begin(ssid, password);

  for (int i = 0; i < 1; i++) {
    pinMode(pins[i], OUTPUT);
  }

  for (int i = 0; i < 1; i++) {
    pinMode(buttons[i], INPUT);
  }

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print("Connecting..\n");
    switchLoop();
  }

  server.on("/receivePWMRequest", receivePWMRequest);
  server.on("/masterStart", masterStart);
  server.begin();

  attachInterrupt(digitalPinToInterrupt(zero_crossing_d2), zero_crosss_int, RISING);
}

void loop() {

  if (WiFi.status() == WL_CONNECTED) { //Check WiFi connection status
    if ( isRegistered == "false") {
      Serial.print("Connected..  " + isRegistered);
      macAddress = WiFi.macAddress();
      localIP = WiFi.localIP().toString();

      Serial.print("\n macAddress : " + macAddress);
      Serial.print("\n localIP : " + localIP);
      Serial.print( "\n");

      for (int i = 0; i < 1; i++) {
        int buttonInput = digitalRead(buttons[i]);
        int pwm = 0;
        String state = "LOW";
        if (buttonInput == HIGH) {
          pwm = 100;
          state = "HIGH";
        }

        Serial.print("\nbuttonInput : " );
        Serial.print(buttonInput);
        Serial.print("\nstate : " );
        Serial.print(state);

        String requestQuery =  "mac_gpio=" + macAddress + "-" + pins[i] + "&ip=" + localIP + "&state=" + state + "&pwm=" + pwm + "&current_sensor=-";
        HTTPClient http;
        http.begin(masterURL + "/slave/new?" + requestQuery); //Specify request destination
        httpCode = http.GET();
        Serial.print( "*************************************************************\n");
        Serial.print(httpCode);
        Serial.print("\n");
        if (httpCode == -1) {
          isRegistered = "false";
        } else {
          isRegistered = "true";
        }
      }
    }

    for (int i = 0; i < 1; i++) {
      int buttonInput = digitalRead(buttons[i]);
      int buttonState = buttonsState[i];

      if (buttonState != buttonInput) {
        buttonsState[i] = buttonInput;
        if ((buttonInput == HIGH)) {
          sendRequest(pins[i], "HIGH" , 100);
        } else {
          sendRequest(pins[i], "LOW" , 0);
        }
      }
    }
  } else {
    switchLoop();
    isRegistered = "false";
  }

  server.handleClient();
}

void sendRequest(int pin, String state, int pwm) {
  String requestQuery =  "mac_gpio=" + macAddress + "-" + pin + "&ip=" + localIP + "&state=" + state + "&pwm=" + pwm + "&current_sensor=-";
  HTTPClient http;
  http.begin(masterURL + "/slave/request?" + requestQuery); //Specify request destination
  httpCode = http.GET();

  if (httpCode > 0) {
    if (http.getString() == "true") {
      if (state == "HIGH") {
        digitalWrite(pin, HIGH);
        dimming = 5;
      } else {
        digitalWrite(pin, LOW);
        dimming = 128;
      }

      for (int i = 0; i < 1; i++) {
        if (pins[i] == pin) {
          freeze[i] = false;
        }
      }
    } else {
      for (int i = 0; i < 1; i++) {
        if (pins[i] == pin) {
          freeze[i] = true;
        }
      }
    }
  }
}


void receivePWMRequest() {
  httpCode = 200;
  if (server.hasArg("gpio") && server.hasArg("state") && server.hasArg("pwm")) {

    String gpio = server.arg("gpio");
    String state = server.arg("state");
    String pwm = server.arg("pwm");

    if (state == "HIGH") {
      if (pwm.toInt() > 0 && pwm.toInt() < 100) {
        dimming = 123 - (pwm.toInt() * 1.23);
        Serial.print(dimming);
        Serial.print("\n");
      } else {
        digitalWrite(gpio.toInt(), HIGH);
      }
    } else {
      digitalWrite(gpio.toInt(), LOW);
      dimming = 128;
    }

    server.send(200, "text/plain", "receiveRequest is done :-)");
  }
}

void masterStart() {
  httpCode = 200;
  isRegistered = "false";
  server.send(200, "text/plain", "masterStart is done :-)");
}

void switchLoop() {
  for (int i = 0; i < 1; i++) {
    int buttonInput = digitalRead(buttons[i]);
    int buttonState = buttonsState[i];

    if (buttonState != buttonInput && freeze[i] == false) {
      buttonsState[i] = buttonInput;
      if ((buttonInput == HIGH)) {
        digitalWrite(pins[i], HIGH);
      } else {
        digitalWrite(pins[i], LOW);
      }
    }
  }
}

void zero_crosss_int()  //function to be fired at the zero crossing to dim the light
{
  if (dimming > 5 && dimming < 128) {
    int dimtime = (75 * dimming);  // For 60Hz =>65
    delayMicroseconds(dimtime);    // Wait till firing the TRIAC
    digitalWrite(pins[0], HIGH);   // Fire the TRIAC
    delayMicroseconds(10);         // triac On propogation delay
    digitalWrite(pins[0], LOW);    // No longer trigger the TRIAC (the next zero crossing will swith it off) TRIAC
  }
}
