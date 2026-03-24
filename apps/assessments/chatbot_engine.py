"""
Intelligent personalized chatbot engine for FacultyMind.
Every response uses REAL data: actual assessment scores, profile details,
and recent chat history to generate genuinely contextual wellness guidance.
"""
from .models import AssessmentResult, ChatMessage
from apps.accounts.models import User

# ── Keyword routing ────────────────────────────────────────────────────────────

KEYWORDS = {
    'score':        ['score', 'index', 'burnout', 'result', 'percentage', 'number', 'report', 'rank'],
    'improve':      ['improve', 'better', 'first', 'priority', 'focus', 'start', 'fix', 'reduce', 'lower', 'change'],
    'why':          ['why', 'reason', 'cause', 'because', 'explain', 'what caused', 'how did'],
    'stress':       ['stress', 'anxious', 'anxiety', 'overwhelmed', 'pressure', 'tension', 'mental health'],
    'workload':     ['workload', 'teaching', 'lectures', 'load', 'classes', 'tasks', 'busy', 'papers', 'grading', 'evaluation'],
    'sleep':        ['sleep', 'tired', 'rest', 'fatigue', 'exhausted', 'insomnia', 'night', 'wake', 'nap'],
    'balance':      ['balance', 'family', 'personal', 'weekend', 'time', 'boundary', 'life', 'home'],
    'satisfaction': ['satisfaction', 'motivation', 'bored', 'happy', 'purpose', 'meaning', 'joy', 'passionate'],
    'support':      ['support', 'management', 'hod', 'head', 'department', 'institution', 'resources', 'facilities'],
    'reminder':     ['remind', 'reminder', 'alert', 'notify', 'schedule', 'tomorrow', 'later', 'next week', 'monday', 'set'],
    'summary':      ['summary', 'report', 'assessment', 'last', 'previous', 'show', 'history', 'breakdown'],
    'tips':         ['tip', 'advice', 'suggest', 'help', 'how', 'what can', 'way', 'strategies', 'plan'],
    'plan':         ['plan', '3-step', 'weekly', 'action', 'routine', 'schedule', 'program'],
    'greeting':     ['hello', 'hi', 'hey', 'good morning', 'good evening', 'namaste', 'howdy', 'what\'s up'],
    'progress':     ['progress', 'track', 'trend', 'improvement', 'compared', 'getting better'],
    'unrelated':    ['politics', 'sports', 'cricket', 'movie', 'news', 'weather', 'recipe', 'coding', 'program'],
}

FACTOR_LABELS = {
    'stress_score':       'Mental Stress',
    'workload_score':     'Teaching Workload',
    'sleep_score':        'Sleep & Physical Health',
    'balance_score':      'Work-Life Balance',
    'satisfaction_score': 'Job Satisfaction',
    'support_score':      'Institutional Support',
}

FACTOR_TIPS = {
    'Mental Stress': [
        "Practice box breathing for 4 minutes between lecture periods.",
        "Write down 3 specific work concerns each morning, then consciously set them aside.",
        "Talk to a trusted colleague about workload pressures — social support halves stress impact.",
        "Use a 'shutdown ritual' — a fixed phrase said at day's end to signal brain-off mode.",
    ],
    'Teaching Workload': [
        "Create reusable lecture templates to cut preparation time by 40%.",
        "Batch-grade lab records in one focused 2-hour session instead of scattered evaluation.",
        "Block two 'no-meeting' focus hours on your calendar daily.",
        "Negotiate one course section reduction with your HOD if the load is unsustainable.",
    ],
    'Sleep & Physical Health': [
        "Set a device-free hard stop at 9 PM — no student emails after that.",
        "A 20-minute post-dinner walk significantly improves both sleep quality and morning alertness.",
        "Move to a fixed wake-up time (even weekends) — consistency is more important than hours.",
        "Avoid checking academic results or WhatsApp groups within 30 minutes of bedtime.",
    ],
    'Work-Life Balance': [
        "Mute all college group chats from Saturday 5 PM to Monday 9 AM.",
        "Schedule one non-negotiable personal activity per week (walk, family dinner, hobby).",
        "Create a separate email address for personal communications to build mental separation.",
        "Practice saying 'let me check my schedule' instead of immediately saying yes to extra tasks.",
    ],
    'Job Satisfaction': [
        "Identify one student each semester to mentor deeply — it consistently restores purpose.",
        "Take on a new research question or inter-college collaboration to reignite intellectual curiosity.",
        "Attend at least one conference or FDP every semester to reconnect with your field.",
        "Reflect on 3 moments this month where you made a real difference to a student.",
    ],
    'Institutional Support': [
        "Document resource gaps formally via email — it creates a paper trail and usually gets faster response.",
        "Request a pre-semester HOD meeting to proactively align workload expectations.",
        "Identify 2-3 faculty allies in your department for informal peer support.",
        "Explore state or central government faculty welfare schemes you might be entitled to.",
    ],
}

# ── Main entry ─────────────────────────────────────────────────────────────────

def get_bot_response(user_message: str, session) -> dict:
    """
    Returns: { message, suggested_chips, reminder_detected }
    """
    msg_lower = user_message.lower().strip()
    ctx = _build_context(session.user_email, session)

    # Unrelated topic guard
    if _matches(msg_lower, KEYWORDS['unrelated']) and not _matches(msg_lower, KEYWORDS['score'] + KEYWORDS['stress'] + KEYWORDS['tips']):
        return {**_handle_unrelated(ctx), 'reminder_detected': None}

    # Reminder detection (highest priority)
    if _matches(msg_lower, KEYWORDS['reminder']):
        reminder_data = _extract_reminder(msg_lower, session.user_email)
        return {**_handle_reminder(msg_lower, ctx, reminder_data), 'reminder_detected': reminder_data}

    # Route by keyword intent
    if _matches(msg_lower, KEYWORDS['greeting']):
        response = _handle_greeting(ctx)
    elif _matches(msg_lower, KEYWORDS['why']):
        response = _handle_why(ctx)
    elif _matches(msg_lower, KEYWORDS['score']) or _matches(msg_lower, KEYWORDS['summary']):
        response = _handle_score(ctx)
    elif _matches(msg_lower, KEYWORDS['improve']) or _matches(msg_lower, KEYWORDS['plan']):
        response = _handle_improve(ctx)
    elif _matches(msg_lower, KEYWORDS['stress']):
        response = _handle_named_factor('Mental Stress', ctx)
    elif _matches(msg_lower, KEYWORDS['workload']):
        response = _handle_named_factor('Teaching Workload', ctx)
    elif _matches(msg_lower, KEYWORDS['sleep']):
        response = _handle_named_factor('Sleep & Physical Health', ctx)
    elif _matches(msg_lower, KEYWORDS['balance']):
        response = _handle_named_factor('Work-Life Balance', ctx)
    elif _matches(msg_lower, KEYWORDS['satisfaction']):
        response = _handle_named_factor('Job Satisfaction', ctx)
    elif _matches(msg_lower, KEYWORDS['support']):
        response = _handle_named_factor('Institutional Support', ctx)
    elif _matches(msg_lower, KEYWORDS['tips']):
        response = _handle_general_tips(ctx)
    elif _matches(msg_lower, KEYWORDS['progress']):
        response = _handle_progress(ctx)
    else:
        response = _handle_fallback(ctx)

    # ── Proactive injection: if stress > 4.2 and response isn't already about stress
    if ctx.get('has_assessment'):
        scores = ctx.get('scores', {})
        if scores.get('stress_score', 0) >= 4.2 and not _matches(msg_lower, KEYWORDS['stress']):
            proactive = _proactive_stress_alert(ctx)
            response['message'] += f"\n\n---\n💡 **Proactive Note:** {proactive}"

    return {**response, 'reminder_detected': None}


# ── Response Handlers ──────────────────────────────────────────────────────────

def _handle_greeting(ctx):
    name = ctx.get('name', 'Professor')
    first = name.split()[0]

    if not ctx.get('has_assessment'):
        return {
            'message': (
                f"Hello, {first}! 👋 I'm your FacultyMind Wellness Assistant — your personalised guide to understanding and reducing teacher burnout.\n\n"
                f"I notice you haven't taken a burnout assessment yet. It takes only 5 minutes and gives me the data I need to help you meaningfully. Shall we start?"
            ),
            'suggested_chips': ['Start my assessment', 'What is burnout?', 'Give me stress tips', 'How does this work?']
        }

    index = ctx['burnout_index']
    risk = ctx['risk_level']
    top_factors = ctx.get('top_factors_list', [])[:2]
    dept = ctx.get('department', '')
    exp = ctx.get('experience', None)

    risk_emoji = {'Low': '🟢', 'Medium': '🟡', 'High': '🔴'}.get(risk, '⚪')
    risk_sentence = {
        'Low':    "You're in a healthy range — the habits you've built are clearly working.",
        'Medium': "There's moderate stress accumulation — addressing it now prevents it from escalating.",
        'High':   "This is a significant signal that needs attention this week."
    }.get(risk, '')

    top_str = " and ".join([f"**{f[0]}** ({f[1]:.1f}/5)" for f in top_factors]) if top_factors else "several factors"
    exp_note = f" With {exp} years of experience, you've navigated challenges before — let's work through this one too." if exp else ""

    dept_note = f" (Department: {dept})" if dept else ""

    return {
        'message': (
            f"Hello, {first}{dept_note}! {risk_emoji}\n\n"
            f"Your latest burnout index is **{index}%** — **{risk} Risk**. {risk_sentence}{exp_note}\n\n"
            f"Your top stress contributors right now are {top_str}. I can help you understand these scores or suggest a personalised action plan."
        ),
        'suggested_chips': ['Explain my burnout score', 'What should I improve first?', 'Give me stress tips', 'Set a reminder']
    }


def _handle_why(ctx):
    """Handle 'why is my burnout high?' type questions."""
    if not ctx.get('has_assessment'):
        return {
            'message': "I need your assessment data to explain your burnout score. Please take the questionnaire first.",
            'suggested_chips': ['Start assessment', 'How does burnout work?']
        }

    index = ctx['burnout_index']
    risk = ctx['risk_level']
    ranked = ctx.get('ranked_factors', [])
    scores = ctx.get('scores', {})

    if not ranked:
        return _handle_score(ctx)

    top = ranked[0]
    second = ranked[1] if len(ranked) > 1 else None
    third = ranked[2] if len(ranked) > 2 else None

    # Build factor analysis
    factor_analysis = f"• **{top[0]}**: {top[1]:.1f}/5 — this is your highest stressor, contributing most to your burnout index"
    if second:
        factor_analysis += f"\n• **{second[0]}**: {second[1]:.1f}/5 — second contributing factor"
    if third and third[1] >= 3.5:
        factor_analysis += f"\n• **{third[0]}**: {third[1]:.1f}/5 — also elevated"

    cause_map = {
        'Mental Stress': "high psychological pressure — likely from student expectations, deadlines, and evaluation cycles",
        'Teaching Workload': "an unsustainable lecture load that leaves little time for recovery or preparation",
        'Sleep & Physical Health': "insufficient rest, which compounds every other stress factor exponentially",
        'Work-Life Balance': "persistent boundary erosion between academic duties and personal time",
        'Job Satisfaction': "reduced sense of purpose or meaning in your current academic role",
        'Institutional Support': "inadequate resources or workplace backing that increases your cognitive load",
    }
    primary_cause = cause_map.get(top[0], "a combination of elevated stress and workload factors")

    return {
        'message': (
            f"📊 **Why Your Burnout Index is {index}% ({risk} Risk)**\n\n"
            f"The primary driver is **{primary_cause}**.\n\n"
            f"**Your Factor Breakdown:**\n{factor_analysis}\n\n"
            f"The weighted burnout model prioritises stress (30%), workload (25%), and sleep (20%) — so high scores in these three areas have the most impact on your overall index."
        ),
        'suggested_chips': [f'Tips for {top[0]}', 'What should I improve first?', 'Set a reminder', 'Show full report']
    }


def _handle_score(ctx):
    if not ctx.get('has_assessment'):
        return {
            'message': "I don't have assessment data for you yet. Please take the burnout questionnaire first — it takes about 5 minutes.",
            'suggested_chips': ['Start assessment', 'What factors are measured?', 'What is burnout?']
        }

    index = ctx['burnout_index']
    risk = ctx['risk_level']
    scores = ctx.get('scores', {})
    ranked = ctx.get('ranked_factors', [])

    risk_color = {'Low': '🟢', 'Medium': '🟡', 'High': '🔴'}.get(risk, '⚪')
    risk_action = {
        'Low':    "Maintain your current balance — consider a monthly self-check.",
        'Medium': "Take targeted action in your top 1-2 factors within the next two weeks.",
        'High':   "Take immediate action — small daily changes can reduce your index by 15-20 points within a month."
    }.get(risk, '')

    # Factor breakdown
    factor_lines = "\n".join([
        f"  • {name}: **{score:.1f}/5** {'⚠️' if score >= 3.8 else ('🔶' if score >= 2.5 else '✅')}"
        for name, score in ranked[:6]
    ])

    return {
        'message': (
            f"📊 **Your Full Burnout Report**\n\n"
            f"{risk_color} **Burnout Index: {index}%** — {risk} Risk\n\n"
            f"**Factor Breakdown (1=low, 5=high burnout):**\n{factor_lines}\n\n"
            f"**Recommended Next Step:** {risk_action}"
        ),
        'suggested_chips': ['Why is my score this high?', 'What should I improve first?', f'Tips for {ranked[0][0] if ranked else "Stress"}', 'Set a reminder']
    }


def _handle_improve(ctx):
    if not ctx.get('has_assessment'):
        return {
            'message': "To build a personalised improvement plan, I first need your assessment results. Please take the burnout questionnaire.",
            'suggested_chips': ['Start assessment']
        }

    ranked = ctx.get('ranked_factors', [])
    if not ranked:
        return _handle_general_tips(ctx)

    top = ranked[0]
    second = ranked[1] if len(ranked) > 1 else None
    index = ctx['burnout_index']
    risk = ctx['risk_level']

    tips = FACTOR_TIPS.get(top[0], [])[:2]
    tips_text = "\n".join([f"• {t}" for t in tips])

    second_str = (
        f"\n\n**Step 2 — Address {second[0]} ({second[1]:.1f}/5):**\n"
        f"{FACTOR_TIPS.get(second[0], ['Identify the specific trigger and take one small action today.'])[0]}"
    ) if second else ""

    return {
        'message': (
            f"🎯 **Your Personalised Improvement Plan** (Burnout Index: {index}%)\n\n"
            f"**Step 1 — Focus on {top[0]} ({top[1]:.1f}/5) first:**\n"
            f"This is your highest stressor right now. Improving it will have the largest cascading effect.\n\n"
            f"{tips_text}"
            f"{second_str}\n\n"
            f"Start with Step 1 for 7 days before tackling Step 2. Consistent small changes outperform dramatic overhauls."
        ),
        'suggested_chips': [f'More tips for {top[0]}', 'Remind me to check in next week', 'Explain my burnout score', 'Set a reminder']
    }


def _handle_named_factor(factor_name, ctx):
    """Handle questions about a specific burnout factor with real score reference."""
    key_map = {
        'Mental Stress':          'stress_score',
        'Teaching Workload':      'workload_score',
        'Sleep & Physical Health':'sleep_score',
        'Work-Life Balance':      'balance_score',
        'Job Satisfaction':       'satisfaction_score',
        'Institutional Support':  'support_score',
    }
    score_key = key_map.get(factor_name)
    score = ctx.get('scores', {}).get(score_key) if score_key else None

    tips = FACTOR_TIPS.get(factor_name, ["Identify your main trigger and make one change today."])[:4]
    tips_text = "\n".join([f"• {t}" for t in tips])

    if score is not None:
        level = "elevated" if score >= 3.8 else ("moderate" if score >= 2.5 else "low")
        score_line = f"Your **{factor_name}** score is **{score:.1f}/5** — currently **{level}**.\n\n"
        urgency = {
            'elevated': "This is one of your key burnout drivers — these strategies should be your top priority:",
            'moderate': "This factor is in a manageable range, but here are strategies to keep it from rising:",
            'low':      "You're handling this well! Here are strategies to maintain that balance:",
        }[level if score >= 3.8 else ('moderate' if score >= 2.5 else 'low')]
        score_line += f"{urgency}\n\n"
    else:
        score_line = f"Here are evidence-based strategies for managing **{factor_name}**:\n\n"

    return {
        'message': f"{score_line}{tips_text}",
        'suggested_chips': ['What should I improve first?', 'Explain my burnout score', 'Set a reminder', 'Show full report']
    }


def _handle_general_tips(ctx):
    risk = ctx.get('risk_level', 'Medium')
    index = ctx.get('burnout_index')
    ranked = ctx.get('ranked_factors', [])
    index_str = f" (your index is {index}%)" if index else ""

    if risk == 'High':
        intro = f"Given your **High Risk** profile{index_str}, here are urgent recovery strategies:"
        tips = [
            "📵 **Digital detox evenings** — disconnect from college groups by 8 PM every day.",
            "🚶 **Daily 15-min walk** — no phone, no work thoughts. Non-negotiable.",
            "📝 **Mental offload habit** — write 3 work drains each day, then consciously let them go.",
            "🛌 **Sleep as medicine** — treat 7+ hours as a professional obligation, not a luxury.",
            "🤝 **Colleague conversation** — share one concern openly with a trusted peer this week.",
        ]
    elif risk == 'Medium':
        intro = f"For your **Medium Risk** profile{index_str}, focus on these preventative strategies:"
        tips = [
            "⏱️ **Pomodoro method**: 25 min deep work, 5 min genuine break — repeat 4 times.",
            "📅 **Weekly joy block**: 1 hour reserved for a hobby or personal learning.",
            "🤝 **Workload conversation**: Initiate one honest discussion about task distribution.",
            "📧 **Email batching**: Check academic email only at 3 fixed times daily.",
        ]
    else:
        intro = f"You're in **Low Risk** — well done! Here's how to stay there:"
        tips = [
            "✅ **Monthly self-check**: Take the assessment every 4 weeks to catch drift early.",
            "📚 **Invest in growth**: One conference or online course per semester keeps motivation high.",
            "💡 **Mentor someone**: Supporting junior faculty generates deep professional satisfaction.",
            "📝 **Gratitude practice**: Note 2 things you enjoyed about teaching each week.",
        ]

    tips_text = "\n".join(tips)
    top_factor_note = f"\n\n💡 Your top current stressor is **{ranked[0][0]}** ({ranked[0][1]:.1f}/5) — ask me specifically about that for targeted advice." if ranked else ""

    return {
        'message': f"{intro}\n\n{tips_text}{top_factor_note}",
        'suggested_chips': ['What should I improve first?', 'Explain my burnout score', 'Set a reminder', 'Show full report']
    }


def _handle_progress(ctx):
    if not ctx.get('has_assessment'):
        return {
            'message': "To track your progress, you'll need at least one completed assessment. Take your first one now to establish a baseline.",
            'suggested_chips': ['Start assessment']
        }
    # Check if there are multiple assessments
    try:
        from .models import AssessmentResult, UserProfile
        profile = UserProfile.objects.filter(email=ctx['email']).first()
        count = AssessmentResult.objects.filter(user=profile).count() if profile else 0
    except Exception:
        count = 1

    index = ctx['burnout_index']
    risk = ctx['risk_level']

    if count == 1:
        return {
            'message': (
                f"📈 **Progress Tracking**\n\n"
                f"You've completed **1 assessment** so far — your current burnout index is **{index}%** ({risk} Risk).\n\n"
                f"Retake the assessment in 2-4 weeks after implementing changes to see your improvement. I'll compare the scores and tell you exactly what's shifted."
            ),
            'suggested_chips': ['What should I improve first?', 'Remind me to retake in 2 weeks', 'Explain my burnout score']
        }

    return {
        'message': (
            f"📈 **Your Progress**\n\n"
            f"You've completed **{count} assessments** on this platform. Your current index is **{index}%** ({risk} Risk).\n\n"
            f"Keep retaking every 4 weeks to track your trend. Consistent action typically reduces the burnout index by 10-20 points within 6 weeks."
        ),
        'suggested_chips': ['Take assessment now', 'What should I improve first?', 'Show my full report']
    }


def _handle_reminder(msg, ctx, reminder_data):
    """Confirm reminder creation with context-aware message."""
    rtype = reminder_data.get('reminder_type', 'custom') if reminder_data else 'custom'
    name = ctx.get('name', 'Professor').split()[0]

    type_confirm = {
        'assessment': f"I've scheduled an **assessment retake reminder** for you, {name}. Taking it regularly helps track your progress.",
        'sleep':      f"Great habit to build, {name}! Your **sleep reminder** has been set. Poor sleep is one of the strongest burnout amplifiers.",
        'break':      f"**Break reminder set!** Regular breaks reduce cognitive fatigue significantly — you'll return sharper.",
        'stress':     f"**Stress check reminder created.** Awareness is the first step — this will help you catch tension early.",
        'custom':     f"Got it, {name}! Your **reminder has been saved**. You can view all your reminders in your dashboard.",
    }

    confirm_msg = type_confirm.get(rtype, type_confirm['custom'])

    return {
        'message': f"⏰ {confirm_msg}\n\nIs there anything else you'd like to work on today?",
        'suggested_chips': ['Explain my burnout score', 'What should I improve first?', 'Give me stress tips', 'Set another reminder']
    }


def _handle_unrelated(ctx):
    name = ctx.get('name', 'Professor').split()[0]
    return {
        'message': (
            f"I'm specifically designed to help with faculty wellness, {name} — burnout assessment, workload management, stress reduction, and related topics.\n\n"
            f"Here's what I can help you with right now:"
        ),
        'suggested_chips': ['Explain my burnout score', 'What should I improve first?', 'Give me stress tips', 'Set a reminder']
    }


def _handle_fallback(ctx):
    name = ctx.get('name', 'Professor').split()[0]
    has_data = ctx.get('has_assessment', False)

    if has_data:
        index = ctx.get('burnout_index', '?')
        risk = ctx.get('risk_level', 'Unknown')
        ranked = ctx.get('ranked_factors', [])
        top = f" Based on your current score of **{index}%** ({risk} Risk), I'd suggest starting with **{ranked[0][0]}** tips." if ranked else ""
        return {
            'message': (
                f"I'm not sure I understood that, {name}, but I'm here to help!{top}\n\n"
                f"Try asking me one of the suggestions below, or rephrase your question:"
            ),
            'suggested_chips': ['Explain my burnout score', 'What should I improve first?', 'Give me stress tips', 'Set a reminder']
        }

    return {
        'message': (
            f"I'm not sure I understood that, {name}. Here's what I can help you with:\n\n"
            "• \"Explain my burnout score\"\n"
            "• \"What should I improve first?\"\n"
            "• \"Give me tips for stress / sleep / workload / balance\"\n"
            "• \"Why is my burnout score high?\"\n"
            "• \"Remind me tomorrow to retake my assessment\""
        ),
        'suggested_chips': ['Explain my burnout score', 'What should I improve first?', 'Give me stress tips', 'Set a reminder']
    }


# ── Proactive alert ────────────────────────────────────────────────────────────

def _proactive_stress_alert(ctx):
    score = ctx.get('scores', {}).get('stress_score', 0)
    index = ctx.get('burnout_index', '?')
    return (
        f"Your Mental Stress score is **{score:.1f}/5** — one of the highest burnout contributors. "
        f"Since stress makes up 30% of your burnout index ({index}%), reducing it would have the fastest measurable impact. "
        f"Ask me \"Tips for stress\" for a targeted action plan."
    )


# ── Context builder ────────────────────────────────────────────────────────────

def _build_context(email, session=None):
    ctx = {'name': 'Professor', 'has_assessment': False, 'email': email}

    # Load profile
    user = User.objects.filter(email=email).first()
    if user:
        ctx['name'] = user.get_full_name() or user.username
        ctx['age'] = user.age
        ctx['experience'] = user.experience
        if user.department:
            ctx['department'] = user.department.name

    # Load latest assessment
    result = AssessmentResult.objects.filter(user__email=email).order_by('-created_at').first()
    if result:
        ctx['has_assessment'] = True
        ctx['burnout_index'] = int(result.burnout_index)
        ctx['risk_level'] = result.risk_level
        ctx['assessment_date'] = result.created_at.strftime('%B %d, %Y')

        scores = {
            'stress_score':       result.stress_score,
            'workload_score':     result.workload_score,
            'sleep_score':        result.sleep_score,
            'balance_score':      result.balance_score,
            'satisfaction_score': result.satisfaction_score,
            'support_score':      result.support_score,
        }
        ctx['scores'] = scores

        ranked = sorted(
            [(FACTOR_LABELS[k], v) for k, v in scores.items()],
            key=lambda x: x[1], reverse=True
        )
        ctx['ranked_factors'] = ranked
        ctx['top_factor'] = ranked[0] if ranked else None
        # Top factors with score >= 3.0 as a simple list
        ctx['top_factors_list'] = [(name, score) for name, score in ranked if score >= 3.0][:3]

    # Load recent chat memory (last 6 messages for context awareness)
    if session:
        try:
            recent = list(ChatMessage.objects.filter(session=session).order_by('-timestamp')[:6])
            ctx['recent_messages'] = [{'role': m.role, 'content': m.content[:120]} for m in reversed(recent)]
        except Exception:
            ctx['recent_messages'] = []

    return ctx


# ── Reminder extractor ─────────────────────────────────────────────────────────

def _extract_reminder(msg, email):
    import re
    from datetime import datetime, timedelta

    type_map = {
        'assessment': ['assessment', 'retake', 'questionnaire', 'test'],
        'sleep':      ['sleep', 'bed', 'rest', 'night'],
        'break':      ['break', 'pause', 'walk', 'stretch'],
        'stress':     ['stress', 'check', 'breathing', 'calm'],
    }

    reminder_type = 'custom'
    for rtype, words in type_map.items():
        if any(w in msg for w in words):
            reminder_type = rtype
            break

    # Day detection
    scheduled_for = None
    now = datetime.now()
    if 'tomorrow' in msg:
        scheduled_for = (now + timedelta(days=1)).replace(hour=9, minute=0, second=0, microsecond=0)
    elif 'tonight' in msg:
        scheduled_for = now.replace(hour=21, minute=0, second=0, microsecond=0)
    elif 'monday' in msg:
        days_ahead = (0 - now.weekday() + 7) % 7 or 7
        scheduled_for = (now + timedelta(days=days_ahead)).replace(hour=9, minute=0, second=0, microsecond=0)
    elif 'next week' in msg:
        scheduled_for = (now + timedelta(weeks=1)).replace(hour=9, minute=0, second=0, microsecond=0)

    # Time extraction: "at 9 PM", "at 8:30 am"
    time_match = re.search(r'at (\d{1,2})(?::(\d{2}))?\s*(am|pm)', msg, re.IGNORECASE)
    if time_match:
        hour = int(time_match.group(1))
        minute = int(time_match.group(2)) if time_match.group(2) else 0
        period = time_match.group(3).lower()
        if period == 'pm' and hour != 12:
            hour += 12
        elif period == 'am' and hour == 12:
            hour = 0
        base = scheduled_for if scheduled_for else (now + timedelta(days=1))
        scheduled_for = base.replace(hour=hour, minute=minute, second=0, microsecond=0)

    return {
        'user_email': email,
        'reminder_type': reminder_type,
        'message': msg.strip(),
        'scheduled_for': scheduled_for.isoformat() if scheduled_for else None,
    }


# ── Helpers ────────────────────────────────────────────────────────────────────

def _matches(text, keywords):
    return any(kw in text for kw in keywords)
