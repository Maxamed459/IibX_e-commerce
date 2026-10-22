from django.db import models

class Order(models.Model):
    PAYMENT_STATUS_PENDING = 'P'
    PAYMENT_STATUS_COMPLETE = 'C'
    PAYMENT_STATUS_FAILED = 'F'
    PAYMENT_METHOD_CASH = 'CASH'
    PAYMENT_METHOD_CARD = 'CARD'
    PAYMENT_METHOD_MOBILEMONEY = 'MOBILEMONEY'
    PAYMENT_STATUS_CHOICES = [
        (PAYMENT_STATUS_PENDING, 'Pending'),
        (PAYMENT_STATUS_COMPLETE, 'Complete'),
        (PAYMENT_STATUS_FAILED, 'Failed')
    ]
    PAYMENT_METHOD_CHOICES = [
        (PAYMENT_METHOD_CASH, 'Cash'),
        (PAYMENT_METHOD_CARD, 'Card'),
        (PAYMENT_METHOD_MOBILEMONEY, 'Mobile Money')
    ]


    placed_at = models.DateTimeField(auto_now_add=True)
    payment_status = models.CharField(
        max_length=1, choices=PAYMENT_STATUS_CHOICES
    )
    payment_method = models.CharField(max_length=15, choices=PAYMENT_METHOD_CHOICES)
    customer = models.ForeignKey

