'use client'
import './ModalForm.scss'
import Inputmask from 'inputmask';
import { useEffect, useRef, useState } from 'react';

export default function ModalForm(){
    
      const inputRef = useRef(null);
      const [formData, setFormData] = useState({ name: '', phone: '', message: ''});
      const [status, setStatus] = useState('');
      const [isSubmitting, setIsSubmitting] = useState(false);
      const [showModal, setShowModal] = useState(false);
    
      useEffect(() => {
        Inputmask({ mask: "+7 (999) 999-99-99", showMaskOnHover: false }).mask(inputRef.current);
      }, []);
    
      const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
      };
    
      const handleSubmit = async (e) => {
        e.preventDefault();
    
        const rawPhone = inputRef.current.inputmask.unmaskedvalue();
    
        if (!rawPhone || rawPhone.length !== 10) {
          setStatus('Введите корректный номер телефона.');
          return;
        }
    
        setIsSubmitting(true);
        setStatus('Отправка...');
    
        try {
          const response = await fetch('/api/send-telegram', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          });
    
          const result = await response.json();
    
          if (result.success) {
            setStatus('Заявка успешно отправлена!');
            setFormData({ name: '', phone: '', message: '' });
            setShowModal(true);
          } else {
            setStatus('Ошибка при отправке. Попробуйте снова.');
          }
        } catch (error) {
          console.error(error);
          setStatus('Ошибка при отправке. Попробуйте снова.');
        }finally {
          setIsSubmitting(false);
        }
      };
    
      const handleCloseModal = () => {
        setShowModal(false); // Закрыть модальное окно
      };
    
    return(
        <>
            <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                    <div className="modal-header">
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <form onSubmit={handleSubmit}>
                            <div className="form-form">
                                            <div className="group">      
                                                <input 
                                                type="text" 
                                                name="name" 
                                                value={formData.name}
                                                onChange={handleChange}
                                                required 
                                                />
                                                <span className="bar"></span>
                                                <label>Имя</label>
                                            </div>
                                            <div className="group">      
                                            <input
                                                ref={inputRef}
                                                type="text"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                required
                                            />
                                                <span className="bar"></span>
                                                <label>Телефон</label>
                                            </div>
                                            <div className="group">      
                                            <textarea
                                                type="text"
                                                name="message"
                                                placeholder=" "
                                                value={formData.message}
                                                onChange={handleChange}
                                                rows={3}
                                            />
                                                <span className="bar"></span>
                                                <label>Комментарий</label>
                                            </div>
                                <span className="conf">Нажимая на кнопку “отправить заявку”, я соглашаюсь с условиями <a href="#"  type="button" data-bs-toggle="modal" data-bs-target="#сonfidentiality">политики конфиденциальности</a></span>
                                </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Закрыть</button>
                        <button type="submit" className="btn btn-primary">
                        {isSubmitting ? (
                            <>
                            Отправка...
                            </>
                        ) : (
                            <>
                            Отправить
                            </>
                        )}
              </button>
                    </div>
                        </form>
                    </div>
                    </div>
                </div>
            </div>
            {showModal && (
                <div className="modal-tg">
                <div className="modal-tg-content">
                    <h2>Заявка отправлена!</h2>
                    <p>Мы получили вашу заявку и свяжемся с вами в ближайшее время</p>
                    <button onClick={handleCloseModal}>Закрыть</button>
                </div>
                </div>
            )}
        </>
    )
}