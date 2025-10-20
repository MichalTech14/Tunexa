# Súbor: database_core.py
# ---
# Definícia hlavnej štruktúry databázy.
# Ostatné súbory budú pridávať dáta do tejto premennej.

auto_audio_db = {}

print("Core databáza inicializovaná.")

# Súbor: data_vag_group.py
# ---
# Dáta pre Volkswagen Group (vrátane Cupra)

vag_group_data = {
    "Skoda": {
        "Octavia": [
            {"generacia": "Gen 3 (5E)", "roky": "2012-2019", "zakladny_system": "Základný (4-8 repro)", "premiovy_system": "Canton Sound System (10 repro)"},
            {"generacia": "Gen 4 (NX)", "roky": "2020-súčasnosť", "zakladny_system": "Základný (8 repro)", "premiovy_system": "Canton Sound System (12 repro)"}
        ],
        "Superb": [
            {"generacia": "Gen 2 (3T) (Facelift)", "roky": "2013-2015", "zakladny_system": "'Swing' / 'Bolero' (8 repro)", "premiovy_system": "Škoda Sound System (10 repro)"},
            {"generacia": "Gen 3 (3V)", "roky": "2015-2023", "zakladny_system": "'Swing' / 'Bolero' (8 repro)", "premiovy_system": "Canton Sound System (12 repro)"}
        ],
        "Kodiaq": [
            {"generacia": "Gen 1", "roky": "2016-2023", "zakladny_system": "Základný (8 repro)", "premiovy_system": "Canton Sound System (10 repro)"}
        ],
        "Fabia": [
            {"generacia": "Gen 3 (NJ)", "roky": "2014-2021", "zakladny_system": "Základný (4 repro)", "premiovy_system": "Škoda Surround (6 repro, Arkamys)"}
        ]
    },
    
    "Volkswagen": {
        "Golf": [
            {"generacia": "Gen 7 (Mk7)", "roky": "2012-2019", "zakladny_system": "'Composition' (4-8 repro)", "premiovy_system": "Dynaudio Excite (10 repro)"},
            {"generacia": "Gen 8 (Mk8)", "roky": "2020-súčasnosť", "zakladny_system": "Základný (7 repro)", "premiovy_system": "Harman Kardon (10 repro)"}
        ],
        "Passat": [
            {"generacia": "B7", "roky": "2010-2014", "zakladny_system": "'RCD 310' (8 repro)", "premiovy_system": "Dynaudio Confidence (10 repro)"},
            {"generacia": "B8", "roky": "2014-2023", "zakladny_system": "'Composition Media' (8 repro)", "premiovy_system": "Dynaudio Confidence (12 repro)"}
        ],
        "Tiguan": [
            {"generacia": "Gen 1 (Facelift)", "roky": "2011-2016", "zakladny_system": "'RCD 310' (8 repro)", "premiovy_system": "Dynaudio (8 repro)"},
            {"generacia": "Gen 2", "roky": "2016-2023", "zakladny_system": "Základný (8 repro)", "premiovy_system": "Dynaudio Excite (10 repro)"}
        ],
        "Polo": [
            {"generacia": "Gen 5 (6R/6C)", "roky": "2009-2017", "zakladny_system": "Základný (4-6 repro)", "premiovy_system": "Žiaden značkový prémiový systém"},
            {"generacia": "Gen 6 (AW)", "roky": "2017-súčasnosť", "zakladny_system": "Základný (4-6 repro)", "premiovy_system": "BeatsAudio (6 repro + subwoofer)"}
        ],
        "Touareg": [
            {"generacia": "Gen 2 (7P)", "roky": "2010-2018", "zakladny_system": "Základný (8 repro)", "premiovy_system": "Dynaudio Confidence (12 repro)"},
            {"generacia": "Gen 3 (CR)", "roky": "2018-súčasnosť", "zakladny_system": "Základný (8 repro)", "premiovy_system": "Dynaudio Consequence (14 repro)"}
        ]
    },
    
    "Audi": {
        "A3": [
            {"generacia": "8V", "roky": "2012-2020", "zakladny_system": "Audi Sound System (10 repro)", "premiovy_system": "Bang & Olufsen Sound System (14 repro)"},
            {"generacia": "8Y", "roky": "2020-súčasnosť", "zakladny_system": "Audi Sound System (10 repro)", "premiovy_system": "Bang & Olufsen 3D (15 repro)"}
        ],
        "A4": [
            {"generacia": "B8 (Facelift)", "roky": "2012-2015", "zakladny_system": "Audi Sound System (10 repro, 180W)", "premiovy_system": "Bang & Olufsen Sound System (14 repro, 505W)"},
            {"generacia": "B9", "roky": "2016-súčasnosť", "zakladny_system": "Audi Sound System (10 repro, 180W)", "premiovy_system": "Bang & Olufsen 3D Sound System (19 repro, 755W)"}
        ],
        "A6": [
            {"generacia": "C7 (4G)", "roky": "2011-2018", "zakladny_system": "Audi Sound System (10 repro, 180W)", "premiovy_system": "Bose Surround (14 repro) ALEBO Bang & Olufsen Advanced 3D (15 repro)"},
            {"generacia": "C8 (4K)", "roky": "2018-súčasnosť", "zakladny_system": "Audi Sound System (10 repro)", "premiovy_system": "Bang & Olufsen Premium 3D (16 repro) ALEBO Bang & Olufsen Advanced 3D (19 repro)"}
        ],
        "Q5": [
            {"generacia": "Gen 1 (8R Facelift)", "roky": "2012-2017", "zakladny_system": "Audi Sound System (10 repro)", "premiovy_system": "Bang & Olufsen Sound System (14 repro)"},
            {"generacia": "Gen 2 (FY)", "roky": "2017-súčasnosť", "zakladny_system": "Audi Sound System (10 repro)", "premiovy_system": "Bang & Olufsen 3D (19 repro)"}
        ],
        "Q7": [
            {"generacia": "Gen 1 (4L Facelift)", "roky": "2009-2015", "zakladny_system": "Základný (8 repro)", "premiovy_system": "Bose Surround (14 repro) ALEBO Bang & Olufsen Advanced (14 repro)"},
            {"generacia": "Gen 2 (4M)", "roky": "2015-súčasnosť", "zakladny_system": "Audi Sound System (10 repro)", "premiovy_system": "Bose 3D (19 repro) ALEBO Bang & Olufsen 3D Advanced (23 repro)"}
        ]
    },
    
    "Seat": {
        "Leon": [
            {"generacia": "Gen 3 (5F)", "roky": "2012-2020", "zakladny_system": "Základný (6-8 repro)", "premiovy_system": "Seat Sound System (10 repro)"},
            {"generacia": "Gen 4 (KL)", "roky": "2020-súčasnosť", "zakladny_system": "Základný (7 repro)", "premiovy_system": "BeatsAudio (10 repro, 340W)"}
        ],
        "Ibiza": [
            {"generacia": "Gen 4 (6J Facelift)", "roky": "2012-2017", "zakladny_system": "Základný (4-6 repro)", "premiovy_system": "Žiaden značkový prémiový systém"},
            {"generacia": "Gen 5 (6F)", "roky": "2017-súčasnosť", "zakladny_system": "Základný (6 repro)", "premiovy_system": "BeatsAudio (7 repro, 300W)"}
        ],
        "Ateca": [
            {"generacia": "Gen 1", "roky": "2016-súčasnosť", "zakladny_system": "Základný (8 repro)", "premiovy_system": "Seat Sound System (10 repro)"}
        ]
    },

    "Cupra": {
        "Formentor": [
            {"generacia": "Gen 1", "roky": "2020-súčasnosť", "zakladny_system": "Základný (7 repro)", "premiovy_system": "BeatsAudio (10 repro, 340W)"}
        ],
        "Born": [
            {"generacia": "Gen 1", "roky": "2021-súčasnosť", "zakladny_system": "Základný (5 repro)", "premiovy_system": "BeatsAudio (10 repro)"}
        ]
    },
    
    "Porsche": {
        "911": [
            {"generacia": "991", "roky": "2011-2018", "zakladny_system": "Sound Package Plus (9 repro)", "premiovy_system": "Bose Surround (12 repro) ALEBO Burmester High-End (12 repro)"},
            {"generacia": "992", "roky": "2019-súčasnosť", "zakladny_system": "Sound Package Plus (8 repro)", "premiovy_system": "Bose Surround (12 repro) ALEBO Burmester High-End (13 repro)"}
        ],
        "Macan": [
            {"generacia": "95B", "roky": "2014-súčasnosť", "zakladny_system": "Sound Package Plus (10 repro, 150W)", "premiovy_system": "Bose Surround (14 repro, 665W) ALEBO Burmester High-End (16 repro, 1000W+)"}
        ],
        "Cayenne": [
            {"generacia": "Gen 2 (92A)", "roky": "2010-2017", "zakladny_system": "Sound Package Plus (10 repro)", "premiovy_system": "Bose Surround (14 repro) ALEBO Burmester High-End (16 repro)"},
            {"generacia": "Gen 3 (PO536)", "roky": "2017-súčasnosť", "zakladny_system": "Sound Package Plus (10 repro)", "premiovy_system": "Bose Surround (14 repro) ALEBO Burmester 3D High-End (21 repro)"}
        ],
        "Panamera": [
            {"generacia": "Gen 1 (970)", "roky": "2009-2016", "zakladny_system": "Sound Package Plus (10 repro)", "premiovy_system": "Bose Surround (14 repro) ALEBO Burmester High-End (16 repro)"},
            {"generacia": "Gen 2 (971)", "roky": "2016-súčasnosť", "zakladny_system": "Hi-Fi (10 repro)", "premiovy_system": "Bose Surround (14 repro) ALEBO Burmester 3D High-End (21 repro)"}
        ]
    },

    "Bentley": {
        "Continental GT": [
            {"generacia": "Gen 3", "roky": "2018-súčasnosť", "zakladny_system": "Bentley Signature (10 repro, 650W)", "premiovy_system": "Bang & Olufsen for Bentley (16 repro, 1500W) ALEBO Naim for Bentley (18 repro, 2200W)"}
        ]
    }
}# Súbor: data_german_premium.py
# ---
# Dáta pre BMW a Mercedes-Benz

german_premium_data = {
    "BMW": {
        "Rad 1": [
            {"generacia": "F20/F21", "roky": "2011-2019", "zakladny_system": "Základný (6 repro) alebo HiFi (7 repro)", "premiovy_system": "Harman Kardon (12 repro)"}
        ],
        "Rad 3": [
            {"generacia": "F30/F31", "roky": "2012-2018", "zakladny_system": "Základný (6 repro) alebo HiFi (9 repro, 205W)", "premiovy_system": "Harman Kardon Surround (16 repro, 600W)"},
            {"generacia": "G20/G21", "roky": "2019-súčasnosť", "zakladny_system": "Základný (6 repro) alebo HiFi (10 repro, 205W)", "premiovy_system": "Harman Kardon Surround (16 repro, 464W)"}
        ],
        "Rad 5": [
            {"generacia": "F10/F11 (Facelift)", "roky": "2013-2016", "zakladny_system": "HiFi (12 repro, 205W)", "premiovy_system": "Harman Kardon (16 repro, 600W) ALEBO Bang & Olufsen High End (16 repro, 1200W)"},
            {"generacia": "G30/G31", "roky": "2017-2023", "zakladny_system": "HiFi (12 repro, 205W)", "premiovy_system": "Harman Kardon (16 repro, 600W) ALEBO Bowers & Wilkins Diamond (16 repro, 1400W)"}
        ],
        "X1": [
            {"generacia": "E84", "roky": "2009-2015", "zakladny_system": "Základný (6 repro) alebo HiFi (8 repro)", "premiovy_system": "Harman Kardon (11 repro)"},
            {"generacia": "F48", "roky": "2015-2022", "zakladny_system": "Základný (6 repro) alebo HiFi (7 repro)", "premiovy_system": "Harman Kardon (12 repro)"}
        ],
        "X3": [
            {"generacia": "F25", "roky": "2010-2017", "zakladny_system": "Základný (6 repro) alebo HiFi (9 repro)", "premiovy_system": "Harman Kardon (16 repro)"},
            {"generacia": "G01", "roky": "2017-súčasnosť", "zakladny_system": "HiFi (12 repro)", "premiovy_system": "Harman Kardon (16 repro)"}
        ],
        "X5": [
            {"generacia": "F15", "roky": "2013-2018", "zakladny_system": "HiFi (9 repro)", "premiovy_system": "Harman Kardon (16 repro) ALEBO Bang & Olufsen High End (16 repro)"},
            {"generacia": "G05", "roky": "2018-súčasnosť", "zakladny_system": "HiFi (10 repro)", "premiovy_system": "Harman Kardon (16 repro) ALEBO Bowers & Wilkins Diamond (20 repro)"}
        ]
    },
    
    "Mercedes-Benz": {
        "A-Class": [
            {"generacia": "W176", "roky": "2012-2018", "zakladny_system": "Audio 20 (6 repro)", "premiovy_system": "Harman Kardon Logic7 (12 repro)"},
            {"generacia": "W177", "roky": "2018-súčasnosť", "zakladny_system": "Základný (6 repro) alebo Advanced (10 repro)", "premiovy_system": "Burmester Surround (12 repro)"}
        ],
        "C-Class": [
            {"generacia": "W204 (Facelift)", "roky": "2011-2014", "zakladny_system": "Audio 20 (cca 8 repro)", "premiovy_system": "Harman Kardon Logic7 (12 repro)"},
            {"generacia": "W205", "roky": "2014-2021", "zakladny_system": "Audio 20 (cca 8 repro)", "premiovy_system": "Burmester Surround (13 repro, 590W)"},
            {"generacia": "W206", "roky": "2021-súčasnosť", "zakladny_system": "Základný systém", "premiovy_system": "Burmester 3D Surround (15 repro, 710W)"}
        ],
        "E-Class": [
            {"generacia": "W212 (Facelift)", "roky": "2013-2016", "zakladny_system": "Audio 20", "premiovy_system": "Harman Kardon Logic7 (14 repro)"},
            {"generacia": "W213", "roky": "2016-2023", "zakladny_system": "Základný (8 repro)", "premiovy_system": "Burmester Surround (13 repro) ALEBO Burmester High-End 3D (23 repro)"}
        ],
        "S-Class": [
            {"generacia": "W222", "roky": "2013-2020", "zakladny_system": "Základný (10 repro)", "premiovy_system": "Burmester Surround (13 repro) ALEBO Burmester High-End 3D (24 repro)"},
            {"generacia": "W223", "roky": "2020-súčasnosť", "zakladny_system": "Burmester 3D Surround (15 repro)", "premiovy_system": "Burmester High-End 4D (31 repro)"}
        ],
        "GLC-Class": [
            {"generacia": "X253", "roky": "2015-2022", "zakladny_system": "Audio 20 (8 repro)", "premiovy_system": "Burmester Surround (13 repro, 590W)"}
        ],
        "GLE-Class": [
            {"generacia": "W166 (ML-Class)", "roky": "2011-2018", "zakladny_system": "Audio 20", "premiovy_system": "Harman Kardon Logic7 (14 repro)"},
            {"generacia": "V167", "roky": "2019-súčasnosť", "zakladny_system": "Advanced (9 repro)", "premiovy_system": "Burmester Surround (13 repro)"}
        ]
    },

    "Toyota": {
        "Yaris": [
            {"generacia": "XP130 (Gen 3)", "roky": "2011-2019", "zakladny_system": "Toyota Touch (4-6 repro)", "premiovy_system": "Žiaden značkový prémiový systém"},
            {"generacia": "XP210 (Gen 4)", "roky": "2020-súčasnosť", "zakladny_system": "Základný (6 repro)", "premiovy_system": "JBL (8 repro)"}
        ],
        "Corolla": [
            {"generacia": "E170 (Gen 11)", "roky": "2013-2018", "zakladny_system": "Toyota Touch 2 (6 repro)", "premiovy_system": "Žiaden značkový prémiový systém (v EÚ)"},
            {"generacia": "E210 (Gen 12)", "roky": "2018-súčasnosť", "zakladny_system": "Základný (6 repro)", "premiovy_system": "JBL (8 repro)"}
        ],
        "C-HR": [
            {"generacia": "Gen 1", "roky": "2016-2023", "zakladny_system": "Základný (6 repro)", "premiovy_system": "JBL (9 repro)"}
        ],
        "RAV4": [
            {"generacia": "XA40 (Gen 4)", "roky": "2013-2018", "zakladny_system": "Toyota Touch 2 (6 repro)", "premiovy_system": "JBL GreenEdge (11 repro)"},
            {"generacia": "XA50 (Gen 5)", "roky": "2019-súčasnosť", "zakladny_system": "Základný (6 repro)", "premiovy_system": "JBL (11 repro)"}
        ]
    },

    "Lexus": {
        "IS": [
            {"generacia": "XE30", "roky": "2013-súčasnosť", "zakladny_system": "Lexus Premium (Pioneer) (10 repro)", "premiovy_system": "Mark Levinson Premium Surround (15 repro, 835W)"}
        ],
        "NX": [
            {"generacia": "AZ10 (Gen 1)", "roky": "2014-2021", "zakladny_system": "Lexus Premium (Pioneer) (10 repro)", "premiovy_system": "Mark Levinson (14 repro)"},
            {"generacia": "AZ20 (Gen 2)", "roky": "2021-súčasnosť", "zakladny_system": "Lexus Premium (10 repro)", "premiovy_system": "Mark Levinson (17 repro)"}
        ],
        "RX": [
            {"generacia": "AL10 (Gen 3 facelift)", "roky": "2012-2015", "zakladny_system": "Lexus Premium (9 repro)", "premiovy_system": "Mark Levinson (15 repro)"},
            {"generacia": "AL20 (Gen 4)", "roky": "2015-2022", "zakladny_system": "Lexus Premium (9 alebo 12 repro)", "premiovy_system": "Mark Levinson (15 repro)"}
        ]
    },

    "Honda": {
        "Civic": [
            {"generacia": "Gen 9 (FK)", "roky": "2012-2017", "zakladny_system": "Základný (4-6 repro)", "premiovy_system": "Honda Premium Audio (8 repro)"},
            {"generacia": "Gen 10 (FK)", "roky": "2017-2022", "zakladny_system": "Základný (8 repro)", "premiovy_system": "Honda Premium Audio (11 repro)"},
            {"generacia": "Gen 11 (FE/FL)", "roky": "2022-súčasnosť", "zakladny_system": "Základný (8 repro)", "premiovy_system": "Bose Centerpoint (12 repro)"}
        ],
        "CR-V": [
            {"generacia": "Gen 4 (RM)", "roky": "2012-2018", "zakladny_system": "Základný (6 repro)", "premiovy_system": "Premium Audio System (7 repro)"},
            {"generacia": "Gen 5 (RW)", "roky": "2018-2023", "zakladny_system": "Základný (8 repro)", "premiovy_system": "Honda Premium Audio (9 repro)"}
        ]
    },

    "Nissan": {
        "Juke": [
            {"generacia": "F16 (Gen 2)", "roky": "2019-súčasnosť", "zakladny_system": "Základný (4 alebo 6 repro)", "premiovy_system": "Bose Personal Plus (8 repro)"}
        ],
        "Qashqai": [
            {"generacia": "J11 (Gen 2)", "roky": "2013-2021", "zakladny_system": "Základný (4 alebo 6 repro)", "premiovy_system": "Bose (8 repro)"},
            {"generacia": "J12 (Gen 3)", "roky": "2021-súčasnosť", "zakladny_system": "Základný (6 repro)", "premiovy_system": "Bose Premium (10 repro)"}
        ],
        "X-Trail": [
            {"generacia": "T32 (Gen 3)", "roky": "2013-2021", "zakladny_system": "Základný (6 repro)", "premiovy_system": "Bose (8 repro)"}
        ]
    },

    "Mazda": {
        "Mazda 3": [
            {"generacia": "BM/BN (Gen 3)", "roky": "2013-2018", "zakladny_system": "Základný (4 alebo 6 repro)", "premiovy_system": "Bose Centerpoint 2 (9 repro)"},
            {"generacia": "BP (Gen 4)", "roky": "2019-súčasnosť", "zakladny_system": "Mazda Harmonic Acoustics (8 repro)", "premiovy_system": "Bose (12 repro)"}
        ],
        "Mazda 6": [
            {"generacia": "GJ/GL (Gen 3)", "roky": "2012-súčasnosť", "zakladny_system": "Základný (4 alebo 6 repro)", "premiovy_system": "Bose Centerpoint 2 (11 repro)"}
        ],
        "CX-5": [
            {"generacia": "KE (Gen 1)", "roky": "2012-2017", "zakladny_system": "Základný (6 repro)", "premiovy_system": "Bose (9 repro)"},
            {"generacia": "KF (Gen 2)", "roky": "2017-súčasnosť", "zakladny_system": "Základný (6 repro)", "premiovy_system": "Bose (10 repro)"}
        ]
    },

    "Subaru": {
        "Outback": [
            {"generacia": "BS (Gen 5)", "roky": "2014-2019", "zakladny_system": "Základný (6 repro)", "premiovy_system": "Harman Kardon (12 repro)"}
        ],
        "Forester": [
            {"generacia": "SJ (Gen 4)", "roky": "2012-2018", "zakladny_system": "Základný (4 alebo 6 repro)", "premiovy_system": "Harman Kardon (8 repro)"}
        ]
    },

    "Mitsubishi": {
        "ASX": [
            {"generacia": "Gen 1 (viacero faceliftov)", "roky": "2010-súčasnosť", "zakladny_system": "Základný (4 alebo 6 repro)", "premiovy_system": "Rockford Fosgate (9 repro, 710W)"}
        ],
        "Outlander": [
            {"generacia": "Gen 3 (PHEV v EÚ)", "roky": "2012-2021", "zakladny_system": "Základný (6 repro)", "premiovy_system": "Rockford Fosgate (9 repro, 710W)"}
        ]
    },
    
    "Suzuki": {
        "Vitara": [
            {"generacia": "Gen 4", "roky": "2015-súčasnosť", "zakladny_system": "Základný (4 repro)", "premiovy_system": "Rozšírený systém (6 repro, 2x tweeter)"}
        ],
        "S-Cross": [
            {"generacia": "Gen 2", "roky": "2013-2021", "zakladny_system": "Základný (4 repro)", "premiovy_system": "Rozšírený systém (6 repro)"}
        ]
    },

    "Hyundai": {
        "i20": [
            {"generacia": "Gen 2 (GB)", "roky": "2014-2020", "zakladny_system": "Základný (4-6 repro)", "premiovy_system": "Žiaden značkový prémiový systém"},
            {"generacia": "Gen 3 (BC3)", "roky": "2020-súčasnosť", "zakladny_system": "Základný (6 repro)", "premiovy_system": "Bose Premium Sound (8 repro)"}
        ],
        "i30": [
            {"generacia": "GD (Gen 2)", "roky": "2012-2017", "zakladny_system": "Základný (4 alebo 6 repro)", "premiovy_system": "Príplatkový systém (6 repro + zosilňovač)"},
            {"generacia": "PD (Gen 3)", "roky": "2017-súčasnosť", "zakladny_system": "Základný (4 alebo 6 repro)", "premiovy_system": "Žiaden značkový prémiový systém (na väčšine EÚ trhov)"}
        ],
        "Tucson": [
            {"generacia": "ix35 (Gen 2)", "roky": "2009-2015", "zakladny_system": "Základný (6 repro)", "premiovy_system": "Infinity Premium Sound (7 repro)"},
            {"generacia": "TL (Gen 3)", "roky": "2015-2020", "zakladny_system": "Základný (6 repro)", "premiovy_system": "Infinity Premium Sound (8 repro)"},
            {"generacia": "NX4 (Gen 4)", "roky": "2020-súčasnosť", "zakladny_system": "Základný (6 repro)", "premiovy_system": "Krell Premium Sound (8 repro)"}
        ],
        "Santa Fe": [
            {"generacia": "Gen 3 (DM)", "roky": "2012-2018", "zakladny_system": "Základný (6 repro)", "premiovy_system": "Infinity Premium Sound (10 repro)"},
            {"generacia": "Gen 4 (TM)", "roky": "2018-súčasnosť", "zakladny_system": "Základný (6 repro)", "premiovy_system": "Krell Premium Sound (10 repro)"}
        ]
    },

    "Kia": {
        "Ceed": [
            {"generacia": "JD (Gen 2)", "roky": "2012-2018", "zakladny_system": "Základný (6 repro)", "premiovy_system": "Infinity Premium Sound (7 repro, na niektorých trhoch)"},
            {"generacia": "CD (Gen 3)", "roky": "2018-súčasnosť", "zakladny_system": "Základný (6 repro)", "premiovy_system": "JBL Premium Sound (8 repro)"}
        ],
        "Sportage": [
            {"generacia": "SL (Gen 3)", "roky": "2010-2015", "zakladny_system": "Základný (6 repro)", "premiovy_system": "Infinity Premium Sound (7 repro)"},
            {"generacia": "QL (Gen 4)", "roky": "2016-2021", "zakladny_system": "Základný (6 repro)", "premiovy_system": "JBL Premium Sound (8 repro)"},
            {"generacia": "NQ5 (Gen 5)", "roky": "2021-súčasnosť", "zakladny_system": "Základný (6 repro)", "premiovy_system": "Harman Kardon Premium Sound (8 repro)"}
        ],
        "Sorento": [
            {"generacia": "Gen 2 (XM Facelift)", "roky": "2012-2014", "zakladny_system": "Základný (6 repro)", "premiovy_system": "Infinity Premium Sound (10 repro)"},
            {"generacia": "Gen 3 (UM)", "roky": "2015-2020", "zakladny_system": "Základný (6 repro)", "premiovy_system": "Infinity Premium Sound (10 repro)"},
            {"generacia": "Gen 4 (MQ4)", "roky": "2020-súčasnosť", "zakladny_system": "Základný (6 repro)", "premiovy_system": "Bose Premium Sound (12 repro)"}
        ]
    },
    
    "Genesis": {
        "G70": [
            {"generacia": "Gen 1", "roky": "2017-súčasnosť (vstup do EÚ cca 2021)", "zakladny_system": "Základný (9 repro)", "premiovy_system": "Lexicon (15 repro)"}
        ],
        "GV80": [
            {"generacia": "Gen 1", "roky": "2020-súčasnosť (vstup do EÚ cca 2021)", "zakladny_system": "Genesis Premium (12 repro)", "premiovy_system": "Lexicon (21 repro)"}
        ]
    }
}
    ,"Peugeot": {
        "208": [
            {"generacia": "Gen 1", "roky": "2012-2019", "zakladny_system": "Základný (4-6 repro)", "premiovy_system": "JBL Hi-Fi (8 repro)"},
            {"generacia": "Gen 2", "roky": "2019-súčasnosť", "zakladny_system": "Základný (6 repro)", "premiovy_system": "Focal (10 repro) - (menej časté)"}
        ],
        "308": [
            {"generacia": "T9 (Gen 2)", "roky": "2013-2021", "zakladny_system": "Základný (6 repro)", "premiovy_system": "Denon Hi-Fi (9 repro)"},
            {"generacia": "P5 (Gen 3)", "roky": "2021-súčasnosť", "zakladny_system": "Základný (6 repro)", "premiovy_system": "Focal Premium Hi-Fi (10 repro)"}
        ],
        "3008": [
            {"generacia": "Gen 1", "roky": "2008-2016", "zakladny_system": "Základný (6 repro)", "premiovy_system": "JBL Hi-Fi (8 repro)"},
            {"generacia": "Gen 2", "roky": "2016-súčasnosť", "zakladny_system": "Základný (8 repro)", "premiovy_system": "Focal Premium Hi-Fi (10 repro)"}
        ],
        "508": [
            {"generacia": "Gen 1", "roky": "2011-2017", "zakladny_system": "Základný (8 repro)", "premiovy_system": "JBL Hi-Fi (10 repro)"},
            {"generacia": "Gen 2", "roky": "2018-súčasnosť", "zakladny_system": "Základný (8 repro)", "premiovy_system": "Focal Premium Hi-Fi (10 repro)"}
        ]
    },
    
    "Citroen": {
        "C3": [
            {"generacia": "Gen 3", "roky": "2016-súčasnosť", "zakladny_system": "Základný (4-6 repro)", "premiovy_system": "Žiaden značkový prémiový systém"}
        ],
        "C4": [
            {"generacia": "Gen 2", "roky": "2010-2018", "zakladny_system": "Základný (6 repro)", "premiovy_system": "Denon Hi-Fi (9 repro, s DSP)"},
            {"generacia": "Gen 3", "roky": "2020-súčasnosť", "zakladny_system": "Základný (6 repro)", "premiovy_system": "Hi-Fi System (8 repro s Arkamys processing)"}
        ],
        "C5 Aircross": [
            {"generacia": "Gen 1", "roky": "2017-súčasnosť", "zakladny_system": "Základný (6 repro)", "premiovy_system": "Citroën HiFi System (8 repro, Arkamys)"}
        ]
    },

    "DS Automobiles": {
        "DS 4": [
            {"generacia": "Gen 2", "roky": "2021-súčasnosť", "zakladny_system": "Základný (8 repro)", "premiovy_system": "Focal Electra (14 repro)"}
        ],
        "DS 7 Crossback": [
            {"generacia": "Gen 1", "roky": "2017-súčasnosť", "zakladny_system": "Základný (8 repro, Arkamys)", "premiovy_system": "Focal Electra (14 repro, 515W)"}
        ]
    },

    "Opel": {
        "Corsa": [
            {"generacia": "E", "roky": "2014-2019", "zakladny_system": "Základný (4-6 repro)", "premiovy_system": "Žiaden značkový prémiový systém"},
            {"generacia": "F", "roky": "2019-súčasnosť", "zakladny_system": "Základný (4-6 repro)", "premiovy_system": "Žiaden značkový prémiový systém"}
        ],
        "Astra": [
            {"generacia": "J (Facelift)", "roky": "2012-2015", "zakladny_system": "Základný (6 repro)", "premiovy_system": "Infinity Sound System (7 repro)"},
            {"generacia": "K", "roky": "2015-2021", "zakladny_system": "Základný (6 repro)", "premiovy_system": "Bose (7 repro)"},
            {"generacia": "L", "roky": "2021-súčasnosť", "zakladny_system": "Základný (6 repro)", "premiovy_system": "Hi-Fi Sound System (8 repro) (Neznačkový)"}
        ],
        "Insignia": [
            {"generacia": "A (Facelift)", "roky": "2013-2017", "zakladny_system": "Základný (7 repro)", "premiovy_system": "Bose (9 repro)"},
            {"generacia": "B", "roky": "2017-2023", "zakladny_system": "Základný (7 repro)", "premiovy_system": "Bose (8 repro)"}
        ]
    },
    
    "Fiat": {
        "500": [
            {"generacia": "Moderný (Facelift)", "roky": "2016-súčasnosť (spaľovací)", "zakladny_system": "Základný (4-6 repro)", "premiovy_system": "BeatsAudio (7 repro, 440W)"},
            {"generacia": "500e (Elektrický)", "roky": "2020-súčasnosť", "zakladny_system": "Základný (4 repro)", "premiovy_system": "JBL Premium Audio (7 repro)"}
        ],
        "Tipo": [
            {"generacia": "Aegae", "roky": "2015-súčasnosť", "zakladny_system": "Uconnect (4 alebo 6 repro)", "premiovy_system": "Žiaden značkový prémiový systém"}
        ]
    },

    "Alfa Romeo": {
        "Giulia": [
            {"generacia": "952", "roky": "2016-súčasnosť", "zakladny_system": "Základný (8 repro)", "premiovy_system": "Harman Kardon (14 repro, 900W)"}
        ],
        "Stelvio": [
            {"generacia": "949", "roky": "2017-súčasnosť", "zakladny_system": "Základný (8 repro)", "premiovy_system": "Harman Kardon (14 repro, 900W)"}
        ],
        "Tonale": [
            {"generacia": "Gen 1", "roky": "2022-súčasnosť", "zakladny_system": "Základný (6 repro)", "premiovy_system": "Harman Kardon (14 repro)"}
        ]
    },

    "Maserati": {
        "Ghibli": [
            {"generacia": "M157", "roky": "2013-súčasnosť", "zakladny_system": "Základný (8 repro)", "premiovy_system": "Harman Kardon (10 repro, 900W) ALEBO Bowers & Wilkins (15 repro, 1280W)"}
        ]
    },

    "Jeep": {
        "Renegade": [
            {"generacia": "Gen 1", "roky": "2014-súčasnosť", "zakladny_system": "Základný (6 repro)", "premiovy_system": "BeatsAudio (9 repro, 506W)"}
        ],
        "Compass": [
            {"generacia": "MP", "roky": "2017-súčasnosť", "zakladny_system": "Základný (6 repro)", "premiovy_system": "BeatsAudio (9 repro, 506W)"}
        ]
    }
} 
    "Renault": {
        "Clio": [
            {"generacia": "Gen 4", "roky": "2012-2019", "zakladny_system": "Základný (4 repro) alebo R-Link (6 repro)", "premiovy_system": "Bose Sound System (7 repro)"},
            {"generacia": "Gen 5", "roky": "2019-súčasnosť", "zakladny_system": "Základný (6 repro)", "premiovy_system": "Bose Sound System (9 repro)"}
        ],
        "Megane": [
            {"generacia": "Gen 3 (Facelift)", "roky": "2012-2016", "zakladny_system": "Základný (4-6 repro)", "premiovy_system": "Bose Sound System (9 repro)"},
            {"generacia": "Gen 4 (Spaľovací)", "roky": "2016-2023", "zakladny_system": "Základný (4-8 repro)", "premiovy_system": "Bose Sound System (9 repro)"},
            {"generacia": "Megane E-Tech (Elektrický)", "roky": "2022-súčasnosť", "zakladny_system": "Arkamys (6 repro)", "premiovy_system": "Harman Kardon (9 repro, 410W)"}
        ],
        "Captur": [
            {"generacia": "Gen 1", "roky": "2013-2019", "zakladny_system": "Základný (4-6 repro)", "premiovy_system": "Bose Sound System (7 repro)"},
            {"generacia": "Gen 2", "roky": "2019-súčasnosť", "zakladny_system": "Základný (6 repro)", "premiovy_system": "Bose Sound System (9 repro)"}
        ],
        "Austral": [
            {"generacia": "Gen 1", "roky": "2022-súčasnosť", "zakladny_system": "Arkamys (8 repro)", "premiovy_system": "Harman Kardon (12 repro)"}
        ]
    },
    
    "Dacia": {
        "Duster": [
            {"generacia": "Gen 1 (Facelift)", "roky": "2013-2017", "zakladny_system": "Základný (2-4 repro)", "premiovy_system": "Media Nav (4 repro)"},
            {"generacia": "Gen 2", "roky": "2017-2023", "zakladny_system": "Základný (4 repro)", "premiovy_system": "Media Nav (6 repro)"}
        ],
        "Sandero": [
            {"generacia": "Gen 2", "roky": "2012-2020", "zakladny_system": "Základný (2-4 repro)", "premiovy_system": "Media Nav (4 repro)"},
            {"generacia": "Gen 3", "roky": "2020-súčasnosť", "zakladny_system": "Základný (4 repro)", "premiovy_system": "Media Nav (6 repro)"}
        ]
    },
    
    "Volvo": {
        "S60/V60": [
             {"generacia": "Gen 2", "roky": "2010-2018", "zakladny_system": "High Performance (8 repro)", "premiovy_system": "Harman Kardon (12 repro)"},
             {"generacia": "Gen 3", "roky": "2019-súčasnosť", "zakladny_system": "High Performance (10 repro)", "premiovy_system": "Harman Kardon (14 repro) ALEBO Bowers & Wilkins (15 repro)"}
        ],
        "S90/V90": [
            {"generacia": "Gen 2", "roky": "2016-súčasnosť", "zakladny_system": "High Performance (10 repro)", "premiovy_system": "Harman Kardon (14 repro) ALEBO Bowers & Wilkins (19 repro)"}
        ],
        "XC60": [
            {"generacia": "Gen 1", "roky": "2008-2017", "zakladny_system": "High Performance (8 repro)", "premiovy_system": "Harman Kardon (12 repro)"},
            {"generacia": "Gen 2", "roky": "2017-súčasnosť", "zakladny_system": "High Performance (10 repro)", "premiovy_system": "Harman Kardon (14 repro) ALEBO Bowers & Wilkins (15 repro)"}
        ],
        "XC90": [
            {"generacia": "Gen 2", "roky": "2015-súčasnosť", "zakladny_system": "High Performance (10 repro)", "premiovy_system": "Harman Kardon (14 repro) ALEBO Bowers & Wilkins (19 repro)"}
        ]
    },

    "Ford": {
        "Fiesta": [
            {"generacia": "Mk7", "roky": "2008-2017", "zakladny_system": "Základný (4-6 repro)", "premiovy_system": "Sony (8 repro)"},
            {"generacia": "Mk8", "roky": "2017-2023", "zakladny_system": "Základný (6 repro)", "premiovy_system": "B&O Play (10 repro)"}
        ],
        "Focus": [
            {"generacia": "Mk3", "roky": "2011-2018", "zakladny_system": "Základný (6 repro)", "premiovy_system": "Sony (10 repro)"},
            {"generacia": "Mk4", "roky": "2018-súčasnosť", "zakladny_system": "Základný (6 repro)", "premiovy_system": "B&O Play (10 repro)"}
        ],
        "Kuga": [
            {"generacia": "Gen 2", "roky": "2012-2019", "zakladny_system": "Základný (6 repro)", "premiovy_system": "Sony (10 repro)"},
            {"generacia": "Gen 3", "roky": "2019-súčasnosť", "zakladny_system": "Základný (6 repro)", "premiovy_system": "B&O Play (10 repro)"}
        ]
    },

    "Jaguar": {
        "XE": [
            {"generacia": "X760", "roky": "2015-súčasnosť", "zakladny_system": "Jaguar Sound (6 repro, 80W)", "premiovy_system": "Meridian Sound (11 repro, 380W) ALEBO Meridian Surround (17 repro, 825W)"}
        ],
        "F-Pace": [
            {"generacia": "X761", "roky": "2016-súčasnosť", "zakladny_system": "Jaguar Sound (8 repro)", "premiovy_system": "Meridian Sound (11 repro, 380W) ALEBO Meridian Surround (17 repro, 825W)"}
        ]
    },
    
    "Land Rover": {
        "Range Rover Evoque": [
            {"generacia": "L538 (Gen 1)", "roky": "2011-2018", "zakladny_system": "Land Rover Sound (8 repro)", "premiovy_system": "Meridian Sound (11 repro, 380W) ALEBO Meridian Surround (17 repro, 825W)"},
            {"generacia": "L551 (Gen 2)", "roky": "2019-súčasnosť", "zakladny_system": "Základný (6 repro) alebo Sound System (10 repro, 180W)", "premiovy_system": "Meridian Sound (14 repro, 400W) ALEBO Meridian Surround (16 repro, 650W)"}
        ],
        "Defender": [
            {"generacia": "L663", "roky": "2020-súčasnosť", "zakladny_system": "Základný (6 repro)", "premiovy_system": "Meridian Sound (10 repro, 400W) ALEBO Meridian Surround (14 repro, 700W)"}
        ]
    },
    
    "Mini": {
        "Cooper (Hatch)": [
            {"generacia": "F56 (Gen 3)", "roky": "2014-súčasnosť", "zakladny_system": "Základný (4 alebo 6 repro)", "premiovy_system": "Harman Kardon (12 repro)"}
        ],
        "Countryman": [
            {"generacia": "F60 (Gen 2)", "roky": "2017-súčasnosť", "zakladny_system": "Základný (6 repro)", "premiovy_system": "Harman Kardon (12 repro)"}
        ]
    }
