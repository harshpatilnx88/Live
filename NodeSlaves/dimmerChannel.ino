#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>
#include <ESP8266WebServer.h>

const char* ssid = "HK";
const char* password = "harshketa";

const int pwm_1_d0 = 10;
const int pwm_2_d1 = 5;
const int pwm_3_d8 = 15;

const int switch_1_d7 = 13;
const int switch_2_d5 = 10;
const int switch_3_d6 = 12;

const int pins[] = {14, 5, 15};
const int buttons[] = {12, 10, 13};
int buttonsState[] = {0, 0, 0};
String states[] = {"LOW", "LOW" , "LOW"};
int pwms[] = {128, 128, 128};
int freeze[] = {false, false, false};
int resp[] = {-1, -1, -1};

String isRegistered = "false";
String localIP = "";
String macAddress = "";
String masterURL = "http://192.168.0.50:3000";
int httpCode = 200;
ESP8266WebServer server(80);

void setup () {

  Serial.begin(115200);
  WiFi.begin(ssid, password);

  for (int i = 0; i < 3; i++) {
    pinMode(pins[i], OUTPUT);
  }

  for (int i = 0; i < 3; i++) {
    pinMode(buttons[i], INPUT);
  }

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print("Connecting..\n");
    switchLoop();
  }

  server.on("/receiveRequest", receiveRequest);
  server.on("/masterStart", masterStart);
  server.begin();

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

      for (int i = 0; i < 3; i++) {
          int buttonInput = digitalRead(buttons[i]);
          int pwm = 128;
          String state = "LOW";
          if (buttonInput == HIGH) {
            pwm = 5;
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
          resp[i] = httpCode;
          
          if (i == 2) {
            boolean flag = true;
            
            for (int r = 0; r < 3; r++) {
              if(resp[r] == -1){
                flag = false;
              }
            }
            if(flag){
            isRegistered = "true";
            }
          }
      }
    }
    for (int i = 0; i < 3; i++) {
      int buttonInput = digitalRead(buttons[i]);
      int buttonState = buttonsState[i];

      if (buttonState != buttonInput) {
        buttonsState[i] = buttonInput;
        if ((buttonInput == HIGH)) {
          sendRequest(pins[i], "HIGH" , i);
        } else {
          sendRequest(pins[i], "LOW" , i);
        }
      }
    }
  } else {
    switchLoop();
    isRegistered = "false";
  }

  server.handleClient();
}

void sendRequest(int pin, String state, int index) {
  int pwm = 128;

  if (state == "HIGH") {
    pwm = 5;
  }

  Serial.print("\npin : ");
  Serial.print(pin);
  Serial.print("\nstate : " + state);
  Serial.print("\npwm : ");
  Serial.print(pwm);

  String requestQuery =  "mac_gpio=" + macAddress + "-" + pin + "&ip=" + localIP + "&state=" + state + "&pwm=" + pwm + "&current_sensor=-";
  HTTPClient http;
  http.begin(masterURL + "/slave/request?" + requestQuery); //Specify request destination
  httpCode = http.GET();

  if (httpCode > 0) {
    String payload = http.getString();
    Serial.println(payload);
    if (payload == "true") {

      if (state == "HIGH") {
        digitalWrite(pin, HIGH);
      } else {
        digitalWrite(pin, LOW);
      }

      for (int i = 0; i < 3; i++) {
        if (pins[i] == pin) {
          freeze[i] = false;
        }
      }
    } else {
      for (int i = 0; i < 3; i++) {
        if (pins[i] == pin) {
          freeze[i] = true;
        }
      }
    }
  }
}

void receiveRequest() {

  if (server.hasArg("gpio") && server.hasArg("state") && server.hasArg("pwm")) {
    String gpio = server.arg("gpio");
    String state = server.arg("state");
    String pwm = server.arg("pwm");

    if (state == "HIGH") {
      digitalWrite(gpio.toInt(), HIGH);
    } else {
      digitalWrite(gpio.toInt(), LOW);
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
  for (int i = 0; i < 3; i++) {
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
