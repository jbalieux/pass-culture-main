from functools import partial
import typing

from flask import render_template
import wtforms
from wtforms import validators
import wtforms_sqlalchemy.fields

from pcapi.admin.validators import PhoneNumberValidator


def widget(field: wtforms.Field, template: str, *args: typing.Any, **kwargs: typing.Any) -> str:
    return render_template(template, field=field)


class PCOptStringField(wtforms.StringField):
    widget = partial(widget, template="components/forms/string_field.html")
    validators = [
        validators.Optional(""),
        validators.Length(min=3, max=64, message="doit contenir entre %(min)d et %(max)d caractères"),
    ]


class PCStringField(PCOptStringField):
    validators = [
        validators.InputRequired("Information obligatoire"),
        validators.Length(min=3, max=64, message="doit contenir entre %(min)d et %(max)d caractères"),
    ]


class PCPostalCodeField(PCStringField):
    validators = [
        validators.Optional(""),
        validators.Length(min=5, max=5, message="Le code postal doit contenir %(max)d caractères"),
    ]


class PCPhoneNumberField(PCStringField):
    validators = [
        validators.Optional(""),
        PhoneNumberValidator(),
    ]


class PCCommentField(PCOptStringField):
    validators = [
        validators.InputRequired("Information obligatoire"),
        validators.Length(min=2, max=1024, message="doit contenir entre %(min)d et %(max)d caractères"),
    ]


class PCEmailField(wtforms.EmailField):
    widget = partial(widget, template="components/forms/string_field.html")
    validators = [
        validators.Email("Email obligatoire"),
        validators.Length(min=3, max=128, message="doit contenir entre %(min)d et %(max)d caractères"),
    ]


class PCDateField(wtforms.DateField):
    widget = partial(widget, template="components/forms/date_field.html")

    def gettext(self, string: str) -> str:
        match string:
            case "Not a valid date value.":
                return "Date invalide"
            case _:
                return string


class PCSelectField(wtforms.SelectField):
    widget = partial(widget, template="components/forms/select_field.html")
    validators = [validators.InputRequired("Information obligatoire")]


class PCSelectWithPlaceholderValueField(wtforms.SelectField):
    widget = partial(widget, template="components/forms/select_with_placeholder_value_field.html")
    validators = [validators.InputRequired("Information obligatoire")]


class PCSelectMultipleField(wtforms.SelectMultipleField):
    widget = partial(widget, template="components/forms/select_multiple_field.html")
    validators = [validators.Optional()]


class PCQuerySelectMultipleField(wtforms_sqlalchemy.fields.QuerySelectMultipleField):
    widget = partial(widget, template="components/forms/select_multiple_field.html")
    validators = [validators.Optional()]

    # Method 'iter_groups' is abstract in class 'SelectFieldBase' and must be overridden
    def iter_groups(self) -> None:
        raise NotImplementedError()


class PCOptSearchField(wtforms.StringField):
    widget = partial(widget, template="components/forms/search_field.html")
    validators = [validators.Optional()]


class PCSearchField(PCOptSearchField):
    validators = [validators.InputRequired("Information obligatoire")]


class PCSwitchBooleanField(wtforms.BooleanField):
    widget = partial(widget, template="components/forms/switch_boolean_field.html")
    false_values = (False, "False", "false", "")
