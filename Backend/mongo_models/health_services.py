from datetime import datetime
from bson import ObjectId

class MongoDBHealthServicesModel:
    """
    MongoDB model for health services data
    """
    collection_name = 'health_services'
    
    @staticmethod
    def create_heart_rate_document(user_id, data):
        """
        Create a heart rate document
        """
        return {
            'user_id': str(user_id),
            'service_type': 'heart_rate',
            'rate': int(data.get('value')),
            'status': data.get('category', 'normal'),
            'notes': data.get('notes', ''),
            'recorded_at': datetime.now()
        }
    
    @staticmethod
    def create_blood_pressure_document(user_id, data):
        """
        Create a blood pressure document
        """
        return {
            'user_id': str(user_id),
            'service_type': 'blood_pressure',
            'systolic': int(data.get('systolic')),
            'diastolic': int(data.get('diastolic')),
            'pulse': int(data.get('pulse')) if data.get('pulse') else None,
            'category': data.get('category', 'uncategorized'),
            'date': data.get('date', datetime.now().strftime('%Y-%m-%d')),
            'time': data.get('time', datetime.now().strftime('%H:%M')),
            'notes': data.get('notes', ''),
            'recorded_at': datetime.now()
        }
    
    @staticmethod
    def create_spo2_document(user_id, data):
        """
        Create an oxygen saturation (SpO2) document
        """
        return {
            'user_id': str(user_id),
            'service_type': 'spo2',
            'oxygen_level': int(data.get('oxygen_level')),
            'pulse': int(data.get('pulse')) if data.get('pulse') else None,
            'category': data.get('category', 'normal'),
            'date': data.get('date', datetime.now().strftime('%Y-%m-%d')),
            'time': data.get('time', datetime.now().strftime('%H:%M')),
            'notes': data.get('notes', ''),
            'recorded_at': datetime.now()
        }
    
    @staticmethod
    def create_respiratory_rate_document(user_id, data):
        """
        Create a respiratory rate document
        """
        return {
            'user_id': str(user_id),
            'service_type': 'respiratory_rate',
            'rate': int(data.get('rate')),
            'status': data.get('status', 'normal'),
            'date': data.get('date', datetime.now().strftime('%Y-%m-%d')),
            'time': data.get('time', datetime.now().strftime('%H:%M')),
            'notes': data.get('notes', ''),
            'recorded_at': datetime.now()
        }
    
    @staticmethod
    def create_temperature_document(user_id, data):
        """
        Create a body temperature document
        """
        return {
            'user_id': str(user_id),
            'service_type': 'temperature',
            'temperature': float(data.get('temperature')),
            'unit': data.get('unit', 'celsius'),
            'method': data.get('method', 'oral'),
            'category': data.get('status', 'normal'),
            'date': data.get('date', datetime.now().strftime('%Y-%m-%d')),
            'time': data.get('time', datetime.now().strftime('%H:%M')),
            'notes': data.get('notes', ''),
            'recorded_at': datetime.now()
        }
    
    @staticmethod
    def create_weight_document(user_id, data):
        """
        Create a weight and BMI document
        """
        return {
            'user_id': str(user_id),
            'service_type': 'weight',
            'weight': float(data.get('weight')),
            'height': float(data.get('height')),
            'unit': data.get('unit', 'kg'),
            'heightUnit': data.get('heightUnit', 'cm'),
            'bmi': float(data.get('bmi')),
            'bmiCategory': data.get('bmiCategory', 'normal'),
            'date': data.get('date', datetime.now().strftime('%Y-%m-%d')),
            'notes': data.get('notes', ''),
            'recorded_at': datetime.now()
        }
    
    @staticmethod
    def create_mood_document(user_id, data):
        """
        Create a mood tracking document
        """
        return {
            'user_id': str(user_id),
            'service_type': 'mood',
            'mood': int(data.get('mood')),
            'mood_label': data.get('moodLabel', ''),
            'tags': data.get('tags', []),
            'notes': data.get('notes', ''),
            'date': data.get('date', datetime.now().strftime('%Y-%m-%d')),
            'time': data.get('time', datetime.now().strftime('%H:%M')),
            'timestamp': data.get('timestamp', datetime.now().isoformat()),
            'recorded_at': datetime.now()
        }
    
    @staticmethod
    def create_anxiety_document(user_id, data):
        """
        Create an anxiety assessment (GAD-7) document
        """
        return {
            'user_id': str(user_id),
            'service_type': 'anxiety',
            'score': int(data.get('score')),
            'level': data.get('level', ''),
            'answers': data.get('answers', []),
            'date': data.get('date', datetime.now().strftime('%Y-%m-%d')),
            'timestamp': data.get('timestamp', datetime.now().isoformat()),
            'recorded_at': datetime.now()
        }
    
    @staticmethod
    def create_depression_document(user_id, data):
        """
        Create a depression assessment (PHQ-9) document
        """
        return {
            'user_id': str(user_id),
            'service_type': 'depression',
            'score': int(data.get('score')),
            'level': data.get('level', ''),
            'answers': data.get('answers', []),
            'date': data.get('date', datetime.now().strftime('%Y-%m-%d')),
            'timestamp': data.get('timestamp', datetime.now().isoformat()),
            'recorded_at': datetime.now()
        }
    
    @staticmethod
    def create_sleep_quality_document(user_id, data):
        """
        Create a sleep quality document
        """
        return {
            'user_id': str(user_id),
            'service_type': 'sleep',
            'hours_slept': float(data.get('hoursSlept')),
            'wake_up_time': data.get('wakeUpTime', ''),
            'restfulness': int(data.get('restfulness')),
            'disturbances': data.get('disturbances', []),
            'screen_time': data.get('screenTime', ''),
            'sleep_score': int(data.get('sleepScore')),
            'date': data.get('date', datetime.now().strftime('%Y-%m-%d')),
            'timestamp': data.get('timestamp', datetime.now().isoformat()),
            'notes': data.get('notes', ''),
            'recorded_at': datetime.now()
        }
    
    @staticmethod
    def create_mental_fatigue_document(user_id, data):
        """
        Create a mental fatigue document
        """
        return {
            'user_id': str(user_id),
            'service_type': 'mental_fatigue',
            'energy_level': int(data.get('energyLevel')),
            'focus_level': int(data.get('focusLevel')), 
            'motivation_level': int(data.get('motivationLevel')),
            'fatigue_score': int(data.get('fatigueScore')),
            'level': data.get('level', ''),
            'answers': data.get('answers', []),
            'date': data.get('date', datetime.now().strftime('%Y-%m-%d')),
            'timestamp': data.get('timestamp', datetime.now().isoformat()),
            'recorded_at': datetime.now()
        }
    
    @staticmethod
    def create_menstrual_cycle_document(user_id, data):
        """
        Create a menstrual cycle tracking document
        """
        return {
            'user_id': str(user_id),
            'service_type': 'menstrual_cycle',
            'start_date': data.get('start_date', datetime.now().strftime('%Y-%m-%d')),
            'end_date': data.get('end_date', ''),
            'flow_intensity': data.get('flow_intensity', 'medium'),
            'symptoms': data.get('symptoms', []),
            'mood': data.get('mood', ''),
            'notes': data.get('notes', ''),
            'recorded_at': datetime.now()
        }
    
    @staticmethod
    def create_fertility_tracker_document(user_id, data):
        """
        Create a fertility tracker document
        """
        return {
            'user_id': str(user_id),
            'service_type': 'fertility_tracker',
            'date': data.get('date', datetime.now().strftime('%Y-%m-%d')),
            'basal_body_temperature': float(data.get('basal_body_temperature', 0)) if data.get('basal_body_temperature') else None,
            'fertile_window': data.get('fertile_window', False),
            'ovulation_day': data.get('ovulation_day', False),
            'notes': data.get('notes', ''),
            'recorded_at': datetime.now()
        }
    
    @staticmethod
    def create_pms_symptom_document(user_id, data):
        """
        Create a PMS symptom logging document
        """
        return {
            'user_id': str(user_id),
            'service_type': 'pms_symptom',
            'date': data.get('date', datetime.now().strftime('%Y-%m-%d')),
            'symptoms': data.get('symptoms', []),
            'severity': data.get('severity', 'medium'),
            'notes': data.get('notes', ''),
            'recorded_at': datetime.now()
        }
    
    @staticmethod
    def create_pregnancy_guide_document(user_id, data):
        """
        Create a pregnancy week-by-week tracking document
        """
        return {
            'user_id': str(user_id),
            'service_type': 'pregnancy_guide',
            'due_date': data.get('due_date', ''),
            'last_period_date': data.get('last_period_date', ''),
            'current_week': int(data.get('current_week', 1)) if data.get('current_week') else 1,
            'notes': data.get('notes', ''),
            'reminders_enabled': data.get('reminders_enabled', False),
            'recorded_at': datetime.now()
        }
    
    @staticmethod
    def create_pcos_checker_document(user_id, data):
        """
        Create a PCOS symptom checker document
        """
        return {
            'user_id': str(user_id),
            'service_type': 'pcos_checker',
            'date': data.get('date', datetime.now().strftime('%Y-%m-%d')),
            'irregular_periods': data.get('irregular_periods', False),
            'acne': data.get('acne', False),
            'hair_growth': data.get('hair_growth', False),
            'weight_gain': data.get('weight_gain', False),
            'risk_score': int(data.get('risk_score', 0)) if data.get('risk_score') else 0,
            'notes': data.get('notes', ''),
            'recorded_at': datetime.now()
        }
    
    @staticmethod
    def to_json(document):
        """
        Convert MongoDB document to JSON format
        """
        if not document:
            return None
        
        # Convert ObjectId to string for JSON serialization
        json_doc = {**document}
        if '_id' in json_doc:
            json_doc['id'] = str(json_doc['_id'])
            del json_doc['_id']
        
        # Convert datetime objects to ISO format strings
        for key, value in json_doc.items():
            if isinstance(value, datetime):
                json_doc[key] = value.isoformat()
        
        return json_doc 