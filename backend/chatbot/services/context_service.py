from assessment.models import UserProfile, AssessmentResult

def build_user_context(email):
    """
    Collects user profile and latest burnout assessment data.
    """
    context = ""
    try:
        user = UserProfile.objects.get(email=email)
        context += f"Name: {user.name}\n"
        context += f"Department: {user.department.name if user.department else 'N/A'}\n"
        context += f"Experience: {user.experience} years\n\n"
        
        last_assessment = AssessmentResult.objects.filter(user=user).order_by('-created_at').first()
        if last_assessment:
            context += "Burnout Assessment:\n"
            context += f"Burnout Index: {last_assessment.burnout_index}\n"
            context += f"Risk Level: {last_assessment.risk_level}\n"
            context += f"Workload Score: {last_assessment.workload_score}\n"
            context += f"Stress Score: {last_assessment.stress_score}\n"
            context += f"Sleep Score: {last_assessment.sleep_score}\n"
            context += f"Work-Life Balance Score: {last_assessment.balance_score}\n"
            context += f"Job Satisfaction Score: {last_assessment.satisfaction_score}\n"
            context += f"Support Score: {last_assessment.support_score}\n"
        else:
            context += "Burnout Assessment: No data found.\n"
            
    except UserProfile.DoesNotExist:
        context = "User Context: Profile not found.\n"
    except Exception as e:
        context = f"User Context: Error building context ({str(e)})\n"
        
    return context
