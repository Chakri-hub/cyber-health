from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
import json
import logging
from mongo_models.services import MongoDBService
from datetime import datetime

logger = logging.getLogger(__name__)
mongo_service = MongoDBService()

@csrf_exempt
@require_http_methods(["POST", "GET"])
def heart_rate(request, user_id=None):
    """
    Handle heart rate data
    """
    if request.method == "POST":
        try:
            # Parse request data
            data = json.loads(request.body)
            
            # Validate required fields
            required_fields = ['value', 'category']
            for field in required_fields:
                if field not in data:
                    return JsonResponse({'error': f'Missing required field: {field}'}, status=400)
            
            # Save heart rate data
            document_id = mongo_service.save_heart_rate(user_id, data)
            
            if document_id:
                return JsonResponse({'success': True, 'id': document_id})
            else:
                return JsonResponse({'error': 'Failed to save heart rate data'}, status=500)
            
        except json.JSONDecodeError:
            logger.error("Invalid JSON in request body")
            return JsonResponse({'error': 'Invalid JSON in request body'}, status=400)
            
        except Exception as e:
            logger.error(f"Error saving heart rate: {str(e)}")
            return JsonResponse({'error': str(e)}, status=500)
    
    elif request.method == "GET":
        try:
            # Get heart rate history
            history = mongo_service.get_heart_rate_history(user_id)
            
            if history is not None:
                return JsonResponse(history, safe=False)
            else:
                return JsonResponse({'error': 'Failed to get heart rate history'}, status=500)
            
        except Exception as e:
            logger.error(f"Error getting heart rate history: {str(e)}")
            return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST", "GET"])
def blood_pressure(request, user_id=None):
    """
    Handle blood pressure data
    """
    if request.method == "POST":
        try:
            # Parse request data
            data = json.loads(request.body)
            
            # Validate required fields
            required_fields = ['systolic', 'diastolic', 'pulse', 'date', 'time']
            for field in required_fields:
                if field not in data:
                    return JsonResponse({'error': f'Missing required field: {field}'}, status=400)
            
            # Save blood pressure data
            result = mongo_service.save_blood_pressure(user_id, data)
            
            if result:
                return JsonResponse({'success': True, 'message': 'Blood pressure data saved successfully'})
            else:
                return JsonResponse({'error': 'Failed to save blood pressure data'}, status=500)
            
        except json.JSONDecodeError:
            logger.error("Invalid JSON in request body")
            return JsonResponse({'error': 'Invalid JSON in request body'}, status=400)
            
        except Exception as e:
            logger.error(f"Error saving blood pressure: {str(e)}")
            return JsonResponse({'error': str(e)}, status=500)
    
    elif request.method == "GET":
        try:
            # Get blood pressure history
            history = mongo_service.get_blood_pressure_history(user_id)
            
            if history is not None:
                return JsonResponse(history, safe=False)
            else:
                return JsonResponse({'error': 'Failed to get blood pressure history'}, status=500)
            
        except Exception as e:
            logger.error(f"Error getting blood pressure history: {str(e)}")
            return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST", "GET"])
def spo2(request, user_id=None):
    """
    Handle SpO2 (oxygen saturation) data
    """
    if request.method == "POST":
        try:
            # Parse request data
            data = json.loads(request.body)
            
            # Validate required fields
            required_fields = ['oxygen_level', 'category']
            for field in required_fields:
                if field not in data:
                    return JsonResponse({'error': f'Missing required field: {field}'}, status=400)
            
            # Save SpO2 data
            document_id = mongo_service.save_spo2(user_id, data)
            
            if document_id:
                return JsonResponse({'success': True, 'id': document_id})
            else:
                return JsonResponse({'error': 'Failed to save SpO2 data'}, status=500)
            
        except json.JSONDecodeError:
            logger.error("Invalid JSON in request body")
            return JsonResponse({'error': 'Invalid JSON in request body'}, status=400)
            
        except Exception as e:
            logger.error(f"Error saving SpO2: {str(e)}")
            return JsonResponse({'error': str(e)}, status=500)
    
    elif request.method == "GET":
        try:
            # Get SpO2 history
            history = mongo_service.get_spo2_history(user_id)
            
            if history is not None:
                return JsonResponse(history, safe=False)
            else:
                return JsonResponse({'error': 'Failed to get SpO2 history'}, status=500)
            
        except Exception as e:
            logger.error(f"Error getting SpO2 history: {str(e)}")
            return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST", "GET"])
def respiratory_rate(request, user_id=None):
    """Handle respiratory rate data from clients"""
    if request.method == "POST":
        try:
            # Parse request data
            data = json.loads(request.body)
            
            # Validate required fields
            required_fields = ['rate', 'date', 'time']
            for field in required_fields:
                if field not in data:
                    return JsonResponse({'error': f'Missing required field: {field}'}, status=400)
            
            # Save respiratory rate data
            result = mongo_service.save_respiratory_rate(user_id, data)
            
            if result:
                return JsonResponse({'success': True, 'message': 'Respiratory rate data saved successfully'})
            else:
                return JsonResponse({'error': 'Failed to save respiratory rate data'}, status=500)
            
        except json.JSONDecodeError:
            logger.error("Invalid JSON in request body")
            return JsonResponse({'error': 'Invalid JSON in request body'}, status=400)
            
        except Exception as e:
            logger.error(f"Error saving respiratory rate: {str(e)}")
            return JsonResponse({'error': str(e)}, status=500)
    
    elif request.method == "GET":
        try:
            # Get respiratory rate history
            history = mongo_service.get_respiratory_rate_history(user_id)
            
            if history is not None:
                return JsonResponse(history, safe=False)
            else:
                return JsonResponse({'error': 'Failed to get respiratory rate history'}, status=500)
            
        except Exception as e:
            logger.error(f"Error getting respiratory rate history: {str(e)}")
            return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST", "GET"])
def temperature(request, user_id=None):
    """
    Handle body temperature data
    """
    if request.method == "POST":
        try:
            # Parse request data
            data = json.loads(request.body)
            
            # Validate required fields
            required_fields = ['temperature', 'unit', 'method', 'date', 'time']
            for field in required_fields:
                if field not in data:
                    return JsonResponse({'error': f'Missing required field: {field}'}, status=400)
            
            # Save temperature data
            result = mongo_service.save_temperature(user_id, data)
            
            if result:
                return JsonResponse({'success': True, 'message': 'Temperature data saved successfully'})
            else:
                return JsonResponse({'error': 'Failed to save temperature data'}, status=500)
            
        except json.JSONDecodeError:
            logger.error("Invalid JSON in request body")
            return JsonResponse({'error': 'Invalid JSON in request body'}, status=400)
            
        except Exception as e:
            logger.error(f"Error saving temperature: {str(e)}")
            return JsonResponse({'error': str(e)}, status=500)
    
    elif request.method == "GET":
        try:
            # Get temperature history
            history = mongo_service.get_temperature_history(user_id)
            
            if history is not None:
                return JsonResponse(history, safe=False)
            else:
                return JsonResponse({'error': 'Failed to get temperature history'}, status=500)
            
        except Exception as e:
            logger.error(f"Error getting temperature history: {str(e)}")
            return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST", "GET"])
def weight(request, user_id=None):
    """
    Handle weight and BMI data
    """
    if request.method == "POST":
        try:
            # Parse request data
            data = json.loads(request.body)
            
            # Validate required fields
            required_fields = ['weight', 'height', 'unit', 'heightUnit', 'bmi', 'date']
            for field in required_fields:
                if field not in data:
                    return JsonResponse({'error': f'Missing required field: {field}'}, status=400)
            
            # Save weight data
            result = mongo_service.save_weight(user_id, data)
            
            if result:
                return JsonResponse({'success': True, 'message': 'Weight data saved successfully'})
            else:
                return JsonResponse({'error': 'Failed to save weight data'}, status=500)
            
        except json.JSONDecodeError:
            logger.error("Invalid JSON in request body")
            return JsonResponse({'error': 'Invalid JSON in request body'}, status=400)
            
        except Exception as e:
            logger.error(f"Error saving weight: {str(e)}")
            return JsonResponse({'error': str(e)}, status=500)
    
    elif request.method == "GET":
        try:
            # Get weight history
            history = mongo_service.get_weight_history(user_id)
            
            if history is not None:
                return JsonResponse(history, safe=False)
            else:
                return JsonResponse({'error': 'Failed to get weight history'}, status=500)
            
        except Exception as e:
            logger.error(f"Error getting weight history: {str(e)}")
            return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST", "GET"])
def mood(request, user_id=None):
    """
    Handle mood tracking data
    """
    # Add CORS headers to response
    def create_response(data, status=200):
        response = JsonResponse(data, status=status)
        response["Access-Control-Allow-Origin"] = "*"  # Or specific origin
        response["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Accept"
        return response
    
    # Handle preflight request
    if request.method == "OPTIONS":
        return create_response({"message": "CORS preflight handled"})
    
    if request.method == "POST":
        try:
            # Parse request data
            data = json.loads(request.body)
            
            # Validate required fields
            required_fields = ['mood', 'date', 'time']
            for field in required_fields:
                if field not in data:
                    return create_response({'error': f'Missing required field: {field}'}, 400)
            
            # Ensure date is not in the future
            try:
                date_str = data.get('date')
                from datetime import datetime
                mood_date = datetime.strptime(date_str, '%Y-%m-%d').date()
                current_date = datetime.now().date()
                if mood_date > current_date:
                    data['date'] = current_date.strftime('%Y-%m-%d')
                    # Also fix timestamp if present
                    if 'timestamp' in data:
                        data['timestamp'] = datetime.now().isoformat()
            except Exception as e:
                logger.warning(f"Error validating date: {str(e)}")
            
            # Save mood data
            result = mongo_service.save_mood(user_id, data)
            
            if result:
                return create_response({'success': True, 'message': 'Mood data saved successfully'})
            else:
                return create_response({'error': 'Failed to save mood data'}, 500)
            
        except json.JSONDecodeError:
            logger.error("Invalid JSON in request body")
            return create_response({'error': 'Invalid JSON in request body'}, 400)
            
        except Exception as e:
            logger.error(f"Error saving mood: {str(e)}")
            return create_response({'error': str(e)}, 500)
    
    elif request.method == "GET":
        try:
            # Get mood history
            history = mongo_service.get_mood_history(user_id)
            
            if history is not None:
                return create_response({'success': True, 'records': history})
            else:
                return create_response({'error': 'Failed to get mood history'}, 500)
            
        except Exception as e:
            logger.error(f"Error getting mood history: {str(e)}")
            return create_response({'error': str(e)}, 500)

@csrf_exempt
@require_http_methods(["POST", "GET"])
def anxiety(request, user_id=None):
    """
    Handle anxiety assessment (GAD-7) data
    """
    if request.method == "POST":
        try:
            # Parse request data
            data = json.loads(request.body)
            
            # Validate required fields
            required_fields = ['score', 'level', 'answers']
            for field in required_fields:
                if field not in data:
                    return JsonResponse({'error': f'Missing required field: {field}'}, status=400)
            
            # Save anxiety assessment data
            result = mongo_service.save_anxiety_assessment(user_id, data)
            
            if result:
                return JsonResponse({'success': True, 'message': 'Anxiety assessment data saved successfully'})
            else:
                return JsonResponse({'error': 'Failed to save anxiety assessment data'}, status=500)
            
        except json.JSONDecodeError:
            logger.error("Invalid JSON in request body")
            return JsonResponse({'error': 'Invalid JSON in request body'}, status=400)
            
        except Exception as e:
            logger.error(f"Error saving anxiety assessment: {str(e)}")
            return JsonResponse({'error': str(e)}, status=500)
    
    elif request.method == "GET":
        try:
            # Get anxiety history
            history = mongo_service.get_anxiety_history(user_id)
            
            if history is not None:
                return JsonResponse({'success': True, 'records': history})
            else:
                return JsonResponse({'error': 'Failed to get anxiety assessment history'}, status=500)
            
        except Exception as e:
            logger.error(f"Error getting anxiety assessment history: {str(e)}")
            return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST", "GET"])
def depression(request, user_id=None):
    """
    Handle depression assessment (PHQ-9) data
    """
    # Add CORS headers to response
    def create_response(data, status=200):
        response = JsonResponse(data, status=status)
        response["Access-Control-Allow-Origin"] = "*"  # Or specific origin
        response["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Accept"
        return response
    
    # Handle preflight request
    if request.method == "OPTIONS":
        return create_response({"message": "CORS preflight handled"})
    
    if request.method == "POST":
        try:
            # Parse request data
            data = json.loads(request.body)
            
            # Validate required fields
            required_fields = ['score', 'level', 'answers']
            for field in required_fields:
                if field not in data:
                    return create_response({'error': f'Missing required field: {field}'}, 400)
            
            # Ensure date is not in the future
            try:
                date_str = data.get('date')
                from datetime import datetime
                if date_str:
                    depression_date = datetime.strptime(date_str, '%Y-%m-%d').date()
                    current_date = datetime.now().date()
                    if depression_date > current_date:
                        data['date'] = current_date.strftime('%Y-%m-%d')
                        # Also fix timestamp if present
                        if 'timestamp' in data:
                            data['timestamp'] = datetime.now().isoformat()
            except Exception as e:
                logger.warning(f"Error validating date: {str(e)}")
            
            # Save depression assessment data
            result = mongo_service.save_depression_assessment(user_id, data)
            
            if result:
                return create_response({'success': True, 'message': 'Depression assessment data saved successfully'})
            else:
                return create_response({'error': 'Failed to save depression assessment data'}, 500)
            
        except json.JSONDecodeError:
            logger.error("Invalid JSON in request body")
            return create_response({'error': 'Invalid JSON in request body'}, 400)
            
        except Exception as e:
            logger.error(f"Error saving depression assessment: {str(e)}")
            return create_response({'error': str(e)}, 500)
    
    elif request.method == "GET":
        try:
            # Get depression history
            history = mongo_service.get_depression_history(user_id)
            
            if history is not None:
                return create_response({'success': True, 'records': history})
            else:
                return create_response({'error': 'Failed to get depression assessment history'}, 500)
            
        except Exception as e:
            logger.error(f"Error getting depression assessment history: {str(e)}")
            return create_response({'error': str(e)}, 500)

@csrf_exempt
@require_http_methods(["POST", "GET"])
def sleep(request, user_id=None):
    """
    Handle sleep quality data
    """
    # Add CORS headers to response
    def create_response(data, status=200):
        response = JsonResponse(data, status=status)
        response["Access-Control-Allow-Origin"] = "*"  # Or specific origin
        response["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Accept"
        return response
    
    # Handle preflight request
    if request.method == "OPTIONS":
        return create_response({"message": "CORS preflight handled"})
    
    if request.method == "POST":
        try:
            # Parse request data
            data = json.loads(request.body)
            
            # Validate required fields
            required_fields = ['hoursSlept', 'wakeUpTime', 'restfulness', 'sleepScore']
            for field in required_fields:
                if field not in data:
                    return create_response({'error': f'Missing required field: {field}'}, 400)
            
            # Ensure date is not in the future
            try:
                date_str = data.get('date')
                from datetime import datetime
                if date_str:
                    sleep_date = datetime.strptime(date_str, '%Y-%m-%d').date()
                    current_date = datetime.now().date()
                    if sleep_date > current_date:
                        data['date'] = current_date.strftime('%Y-%m-%d')
                        # Also fix timestamp if present
                        if 'timestamp' in data:
                            data['timestamp'] = datetime.now().isoformat()
            except Exception as e:
                logger.warning(f"Error validating date: {str(e)}")
            
            # Save sleep quality data
            result = mongo_service.save_sleep_quality(user_id, data)
            
            if result:
                return create_response({'success': True, 'message': 'Sleep quality data saved successfully'})
            else:
                return create_response({'error': 'Failed to save sleep quality data'}, 500)
            
        except json.JSONDecodeError:
            logger.error("Invalid JSON in request body")
            return create_response({'error': 'Invalid JSON in request body'}, 400)
            
        except Exception as e:
            logger.error(f"Error saving sleep quality: {str(e)}")
            return create_response({'error': str(e)}, 500)
    
    elif request.method == "GET":
        try:
            # Get sleep quality history
            history = mongo_service.get_sleep_quality_history(user_id)
            
            if history is not None:
                return create_response({'success': True, 'records': history})
            else:
                return create_response({'error': 'Failed to get sleep quality history'}, 500)
            
        except Exception as e:
            logger.error(f"Error getting sleep quality history: {str(e)}")
            return create_response({'error': str(e)}, 500)

@csrf_exempt
@require_http_methods(["POST", "GET"])
def mental_fatigue(request, user_id=None):
    """
    Handle mental fatigue assessment data
    """
    # Add CORS headers to response
    def create_response(data, status=200):
        response = JsonResponse(data, status=status)
        response["Access-Control-Allow-Origin"] = "*"  # Or specific origin
        response["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Accept"
        return response
    
    # Handle preflight request
    if request.method == "OPTIONS":
        return create_response({"message": "CORS preflight handled"})
    
    if request.method == "POST":
        try:
            # Parse request data
            data = json.loads(request.body)
            
            # Validate required fields
            required_fields = ['energyLevel', 'focus', 'motivation', 'stressLevel', 
                              'mentalClarity', 'decisionMaking', 'emotionalState',
                              'physicalSigns', 'fatigueScore', 'fatigueLevel', 
                              'date', 'time']
            
            for field in required_fields:
                if field not in data:
                    return create_response({'error': f'Missing required field: {field}'}, 400)
            
            # Ensure date is not in the future
            try:
                date_str = data.get('date')
                from datetime import datetime
                if date_str:
                    assessment_date = datetime.strptime(date_str, '%Y-%m-%d').date()
                    current_date = datetime.now().date()
                    if assessment_date > current_date:
                        data['date'] = current_date.strftime('%Y-%m-%d')
                        # Also fix timestamp if present
                        if 'timestamp' in data:
                            data['timestamp'] = datetime.now().isoformat()
            except Exception as e:
                logger.warning(f"Error validating date: {str(e)}")
            
            # Save mental fatigue data
            result = mongo_service.save_mental_fatigue(user_id, data)
            
            if result:
                return create_response({'success': True, 'message': 'Mental fatigue data saved successfully'})
            else:
                return create_response({'error': 'Failed to save mental fatigue data'}, 500)
            
        except json.JSONDecodeError:
            logger.error("Invalid JSON in request body")
            return create_response({'error': 'Invalid JSON in request body'}, 400)
            
        except Exception as e:
            logger.error(f"Error saving mental fatigue assessment: {str(e)}")
            return create_response({'error': str(e)}, 500)
    
    elif request.method == "GET":
        try:
            # Get mental fatigue history
            history = mongo_service.get_mental_fatigue_history(user_id)
            
            if history is not None:
                return create_response({'success': True, 'records': history})
            else:
                return create_response({'error': 'Failed to get mental fatigue history'}, 500)
            
        except Exception as e:
            logger.error(f"Error getting mental fatigue history: {str(e)}")
            return create_response({'error': str(e)}, 500)

@csrf_exempt
@require_http_methods(["POST", "GET"])
def menstrual_cycle(request, user_id=None):
    """
    Handle menstrual cycle tracking data
    """
    def create_response(data, status=200):
        return JsonResponse(data, status=status, safe=False)
    
    def sanitize_parameters(data):
        """Sanitize input parameters for menstrual cycle tracking"""
        sanitized = {}
        
        # Required fields with defaults
        sanitized['start_date'] = data.get('start_date', datetime.now().strftime('%Y-%m-%d'))
        
        # Optional fields
        if 'end_date' in data:
            sanitized['end_date'] = data.get('end_date')
        
        # Validate flow intensity
        flow_options = ['light', 'medium', 'heavy', 'very heavy']
        flow = data.get('flow_intensity', 'medium').lower()
        sanitized['flow_intensity'] = flow if flow in flow_options else 'medium'
        
        # Sanitize symptoms array
        valid_symptoms = ['cramps', 'headache', 'bloating', 'fatigue', 'mood swings', 'backache', 'breast tenderness']
        symptoms = data.get('symptoms', [])
        if isinstance(symptoms, list):
            sanitized['symptoms'] = [s for s in symptoms if s in valid_symptoms]
        else:
            sanitized['symptoms'] = []
        
        # Additional fields
        sanitized['mood'] = data.get('mood', '')
        sanitized['notes'] = data.get('notes', '')
        
        return sanitized
    
    if request.method == "POST":
        try:
            # Parse request data
            data = json.loads(request.body)
            
            # Sanitize input parameters
            sanitized_data = sanitize_parameters(data)
            
            # Save menstrual cycle data
            document_id = mongo_service.save_menstrual_cycle(user_id, sanitized_data)
            
            if document_id:
                return create_response({'success': True, 'id': document_id})
            else:
                return create_response({'error': 'Failed to save menstrual cycle data'}, 500)
        except json.JSONDecodeError:
            logger.error("Invalid JSON in request body")
            return create_response({'error': 'Invalid JSON in request body'}, 400)
        except Exception as e:
            logger.error(f"Error saving menstrual cycle data: {str(e)}")
            return create_response({'error': str(e)}, 500)
    
    elif request.method == "GET":
        try:
            # Get menstrual cycle history
            history = mongo_service.get_menstrual_cycle_history(user_id)
            
            if history is not None:
                return create_response(history)
            else:
                return create_response({'error': 'Failed to get menstrual cycle history'}, 500)
        except Exception as e:
            logger.error(f"Error getting menstrual cycle history: {str(e)}")
            return create_response({'error': str(e)}, 500)

@csrf_exempt
@require_http_methods(["POST", "GET"])
def fertility_tracker(request, user_id=None):
    """
    Handle fertility tracker data
    """
    def create_response(data, status=200):
        return JsonResponse(data, status=status, safe=False)
    
    def sanitize_parameters(data):
        """Sanitize input parameters for fertility tracker"""
        sanitized = {}
        
        # Basic date field
        sanitized['date'] = data.get('date', datetime.now().strftime('%Y-%m-%d'))
        
        # Validate basal body temperature if provided
        if 'basal_body_temperature' in data:
            try:
                temp = float(data['basal_body_temperature'])
                # Valid temperature range check (in celsius)
                if 35.0 <= temp <= 38.0:
                    sanitized['basal_body_temperature'] = temp
            except (ValueError, TypeError):
                pass  # Ignore invalid temperatures
        
        # Boolean fields
        sanitized['fertile_window'] = bool(data.get('fertile_window', False))
        sanitized['ovulation_day'] = bool(data.get('ovulation_day', False))
        
        # Notes
        sanitized['notes'] = data.get('notes', '')
        
        return sanitized
    
    if request.method == "POST":
        try:
            # Parse request data
            data = json.loads(request.body)
            
            # Sanitize input parameters
            sanitized_data = sanitize_parameters(data)
            
            # Save fertility tracker data
            document_id = mongo_service.save_fertility_tracker(user_id, sanitized_data)
            
            if document_id:
                return create_response({'success': True, 'id': document_id})
            else:
                return create_response({'error': 'Failed to save fertility tracker data'}, 500)
        except json.JSONDecodeError:
            logger.error("Invalid JSON in request body")
            return create_response({'error': 'Invalid JSON in request body'}, 400)
        except Exception as e:
            logger.error(f"Error saving fertility tracker data: {str(e)}")
            return create_response({'error': str(e)}, 500)
    
    elif request.method == "GET":
        try:
            # Get fertility tracker history
            history = mongo_service.get_fertility_tracker_history(user_id)
            
            if history is not None:
                return create_response(history)
            else:
                return create_response({'error': 'Failed to get fertility tracker history'}, 500)
        except Exception as e:
            logger.error(f"Error getting fertility tracker history: {str(e)}")
            return create_response({'error': str(e)}, 500)

@csrf_exempt
@require_http_methods(["POST", "GET"])
def pms_symptom(request, user_id=None):
    """
    Handle PMS symptom logging
    """
    def create_response(data, status=200):
        return JsonResponse(data, status=status, safe=False)
    
    def sanitize_parameters(data):
        """Sanitize input parameters for PMS symptom logger"""
        sanitized = {}
        
        # Basic date field
        sanitized['date'] = data.get('date', datetime.now().strftime('%Y-%m-%d'))
        
        # Sanitize symptoms array
        valid_symptoms = ['mood swings', 'cravings', 'bloating', 'irritability', 'headache', 'fatigue', 'anxiety', 'breast tenderness']
        symptoms = data.get('symptoms', [])
        if isinstance(symptoms, list):
            sanitized['symptoms'] = [s for s in symptoms if s in valid_symptoms]
        else:
            sanitized['symptoms'] = []
        
        # Validate severity
        severity_options = ['mild', 'medium', 'severe']
        severity = data.get('severity', 'medium').lower()
        sanitized['severity'] = severity if severity in severity_options else 'medium'
        
        # Notes
        sanitized['notes'] = data.get('notes', '')
        
        return sanitized
    
    if request.method == "POST":
        try:
            # Parse request data
            data = json.loads(request.body)
            
            # Sanitize input parameters
            sanitized_data = sanitize_parameters(data)
            
            # Save PMS symptom data
            document_id = mongo_service.save_pms_symptom(user_id, sanitized_data)
            
            if document_id:
                return create_response({'success': True, 'id': document_id})
            else:
                return create_response({'error': 'Failed to save PMS symptom data'}, 500)
        except json.JSONDecodeError:
            logger.error("Invalid JSON in request body")
            return create_response({'error': 'Invalid JSON in request body'}, 400)
        except Exception as e:
            logger.error(f"Error saving PMS symptom data: {str(e)}")
            return create_response({'error': str(e)}, 500)
    
    elif request.method == "GET":
        try:
            # Get PMS symptom history
            history = mongo_service.get_pms_symptom_history(user_id)
            
            if history is not None:
                return create_response(history)
            else:
                return create_response({'error': 'Failed to get PMS symptom history'}, 500)
        except Exception as e:
            logger.error(f"Error getting PMS symptom history: {str(e)}")
            return create_response({'error': str(e)}, 500)

@csrf_exempt
@require_http_methods(["POST", "GET"])
def pregnancy_guide(request, user_id=None):
    """
    Handle pregnancy week-by-week guide
    """
    def create_response(data, status=200):
        return JsonResponse(data, status=status, safe=False)
    
    def sanitize_parameters(data):
        """Sanitize input parameters for pregnancy guide"""
        sanitized = {}
        
        # Check for either due date or last period date
        if 'due_date' in data:
            sanitized['due_date'] = data.get('due_date')
        
        if 'last_period_date' in data:
            sanitized['last_period_date'] = data.get('last_period_date')
        
        # Ensure we have at least one of the required dates
        if 'due_date' not in sanitized and 'last_period_date' not in sanitized:
            sanitized['due_date'] = datetime.now().strftime('%Y-%m-%d')
        
        # Validate current week
        if 'current_week' in data:
            try:
                week = int(data['current_week'])
                if 1 <= week <= 42:  # Valid pregnancy weeks
                    sanitized['current_week'] = week
            except (ValueError, TypeError):
                sanitized['current_week'] = 1
        
        # Boolean fields
        sanitized['reminders_enabled'] = bool(data.get('reminders_enabled', False))
        
        # Notes
        sanitized['notes'] = data.get('notes', '')
        
        return sanitized
    
    if request.method == "POST":
        try:
            # Parse request data
            data = json.loads(request.body)
            
            # Sanitize input parameters
            sanitized_data = sanitize_parameters(data)
            
            # Save pregnancy guide data
            document_id = mongo_service.save_pregnancy_guide(user_id, sanitized_data)
            
            if document_id:
                return create_response({'success': True, 'id': document_id})
            else:
                return create_response({'error': 'Failed to save pregnancy guide data'}, 500)
        except json.JSONDecodeError:
            logger.error("Invalid JSON in request body")
            return create_response({'error': 'Invalid JSON in request body'}, 400)
        except Exception as e:
            logger.error(f"Error saving pregnancy guide data: {str(e)}")
            return create_response({'error': str(e)}, 500)
    
    elif request.method == "GET":
        try:
            # Get pregnancy guide data
            guide_data = mongo_service.get_pregnancy_guide(user_id)
            
            if guide_data is not None:
                return create_response(guide_data)
            else:
                return create_response({'error': 'Failed to get pregnancy guide data'}, 500)
        except Exception as e:
            logger.error(f"Error getting pregnancy guide data: {str(e)}")
            return create_response({'error': str(e)}, 500)

@csrf_exempt
@require_http_methods(["POST", "GET"])
def pcos_checker(request, user_id=None):
    """
    Handle PCOS symptom checker
    """
    def create_response(data, status=200):
        return JsonResponse(data, status=status, safe=False)
    
    def sanitize_parameters(data):
        """Sanitize input parameters for PCOS symptom checker"""
        sanitized = {}
        
        # Basic date field
        sanitized['date'] = data.get('date', datetime.now().strftime('%Y-%m-%d'))
        
        # Boolean symptom fields
        sanitized['irregular_periods'] = bool(data.get('irregular_periods', False))
        sanitized['acne'] = bool(data.get('acne', False))
        sanitized['hair_growth'] = bool(data.get('hair_growth', False))
        sanitized['weight_gain'] = bool(data.get('weight_gain', False))
        
        # Calculate risk score if not provided
        if 'risk_score' in data:
            try:
                score = int(data['risk_score'])
                if 0 <= score <= 10:  # Valid score range
                    sanitized['risk_score'] = score
            except (ValueError, TypeError):
                pass
        
        # If no risk score provided, calculate based on symptoms
        if 'risk_score' not in sanitized:
            score = sum([
                2 if sanitized['irregular_periods'] else 0,
                1 if sanitized['acne'] else 0,
                2 if sanitized['hair_growth'] else 0,
                1 if sanitized['weight_gain'] else 0
            ])
            sanitized['risk_score'] = score
        
        # Notes
        sanitized['notes'] = data.get('notes', '')
        
        return sanitized
    
    if request.method == "POST":
        try:
            # Parse request data
            data = json.loads(request.body)
            
            # Sanitize input parameters
            sanitized_data = sanitize_parameters(data)
            
            # Save PCOS checker data
            document_id = mongo_service.save_pcos_checker(user_id, sanitized_data)
            
            if document_id:
                return create_response({'success': True, 'id': document_id})
            else:
                return create_response({'error': 'Failed to save PCOS checker data'}, 500)
        except json.JSONDecodeError:
            logger.error("Invalid JSON in request body")
            return create_response({'error': 'Invalid JSON in request body'}, 400)
        except Exception as e:
            logger.error(f"Error saving PCOS checker data: {str(e)}")
            return create_response({'error': str(e)}, 500)
    
    elif request.method == "GET":
        try:
            # Get PCOS checker history
            history = mongo_service.get_pcos_checker_history(user_id)
            
            if history is not None:
                return create_response(history)
            else:
                return create_response({'error': 'Failed to get PCOS checker history'}, 500)
        except Exception as e:
            logger.error(f"Error getting PCOS checker history: {str(e)}")
            return create_response({'error': str(e)}, 500) 