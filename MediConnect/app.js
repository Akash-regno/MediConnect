document.addEventListener('DOMContentLoaded', function() {
            const appointmentData = JSON.parse(sessionStorage.getItem('appointmentFormData'));
            
            if (appointmentData) {
                document.getElementById('payment-amount').textContent = `₹${appointmentData.fee}`;
                document.getElementById('payment-doctor').textContent = appointmentData.doctor;
                document.getElementById('payment-description').textContent = 
                    `Appointment on ${formatDate(appointmentData.appointmentDate)} at ${appointmentData.timeSlot}`;
            } else {
                window.location.href = 'appointments.html';
            }
        });

        function formatDate(dateString) {
            const options = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
            return new Date(dateString).toLocaleDateString('en-IN', options);
        }
        let selectedPaymentOption = 'upi';
        let selectedUpiApp = '';

        function selectPaymentOption(option) {
            selectedPaymentOption = option;
            
            document.querySelectorAll('.payment-option').forEach(el => {
                el.classList.remove('selected');
            });
            document.getElementById(`${option}Option`).classList.add('selected');
        }
        function selectUpiApp(element, app) {
            selectedUpiApp = app;
            document.querySelectorAll('.upi-app').forEach(el => {
                el.classList.remove('selected');
            });
            element.classList.add('selected');
            const upiIdField = document.getElementById('upiId');
            const name = 'customer'; 
            switch(app) {
                case 'gpay':
                    upiIdField.placeholder = `${name}@okicici`;
                    break;
                case 'phonepe':
                    upiIdField.placeholder = `${name}@ybl`;
                    break;
                case 'paytm':
                    upiIdField.placeholder = `${name}@paytm`;
                    break;
                case 'amazonpay':
                    upiIdField.placeholder = `${name}@apl`;
                    break;
            }
        }

        function processUpiPayment() {
            const upiId = document.getElementById('upiId').value;
            const appointmentData = JSON.parse(sessionStorage.getItem('appointmentFormData'));
            
            if (!upiId) {
                alert('Please enter your UPI ID or select a UPI app');
                return;
            }
            if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(upiId)) {
                alert('Please enter a valid UPI ID (e.g., yourname@upi)');
                return;
            }
            alert(`Payment request of ₹${appointmentData.fee} sent to ${upiId}\n\nPlease approve the payment in your UPI app`);
            setTimeout(() => {
                completePayment(appointmentData);
            }, 2000);
        }
        document.getElementById('rzp-button').onclick = function(e) {
            const appointmentData = JSON.parse(sessionStorage.getItem('appointmentFormData'));
            
            const options = {
                "key": "Replace with your Razorpay key", // Replace with your Razorpay key
                "amount": appointmentData.fee * 100, // Amount in paise
                "currency": "INR",
                "name": "MediConnect Healthcare",
                "description": `Appointment with ${appointmentData.doctor}`,
                "image": "profile.png",
                "handler": function(response) {
                    completePayment(appointmentData);
                },
                "prefill": {
                    "name": `${appointmentData.firstName} ${appointmentData.lastName}`,
                    "email": appointmentData.email,
                    "contact": appointmentData.phone
                },
                "notes": {
                    "appointment_date": appointmentData.appointmentDate,
                    "appointment_time": appointmentData.timeSlot
                },
                "theme": {
                    "color": "#0066cc"
                }
            };
            
            const rzp = new Razorpay(options);
            rzp.open();
            
            rzp.on('payment.failed', function(response) {
                alert(`Payment failed: ${response.error.description}\nPlease try another payment method.`);
            });
        };

        function completePayment(appointmentData) {
            sessionStorage.setItem('paymentStatus', 'success');
            sessionStorage.setItem('paymentMethod', selectedPaymentOption);
            
            const confirmationMessage = `
                <h2>Payment Successful!</h2>
                <p>₹${appointmentData.fee} paid via ${selectedPaymentOption === 'upi' ? 'UPI' : 'Card'}</p>
                <div class="confirmation-details">
                    <h3>Appointment Details</h3>
                    <p><strong>Doctor:</strong> ${appointmentData.doctor}</p>
                    <p><strong>Date:</strong> ${formatDate(appointmentData.appointmentDate)} at ${appointmentData.timeSlot}</p>
                    <p><strong>Reason:</strong> ${appointmentData.reason}</p>
                </div>
                <p>A confirmation has been sent to ${appointmentData.email}</p>
            `;
            
            sessionStorage.setItem('confirmationMessage', confirmationMessage);
            window.location.href = 'confirmation.html';
        }