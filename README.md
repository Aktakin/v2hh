# version2hh

HackHilis Version 2 — standalone game build (easy Vercel deploy).

## Changes from V1

- Missions tab removed (Home / Store / Devices / **Ops**)
- **Ops**: multi-domain simulated attacks

## Ops (simulation only)

**Domains:** Public Wi‑Fi · Email phishing · Bluetooth/BLE · IoT & printers · Physical/social · Enterprise edge

**Wi‑Fi toolkit** (gated chain — game mimic, not real tools):

- Recon: monitor mode, SSID discovery, packet capture, client profiling, passive-only  
- Auth: WEP, handshake + crack, PMKID, WPS, router admin, rogue AP, evil twin, captive portal, Karma, WPA-Enterprise  
- MitM: ARP, DNS, SSL strip, DHCP, ICMP redirect, session hijack, traffic inject  
- DoS: deauth flood, beacon flood, channel jam (sim)  
- Endpoint: nmap, SMB, browser drive-by, BLE side, IoT, QR drop, juice-jacking  
- Stealth: MAC spoof, traffic throttle  

No real RF, mail, or networks are involved.

## Local

```bash
npm install
npm start
```

## Deploy on Vercel

Import the repo, leave Root Directory empty, Framework Vite, deploy.
