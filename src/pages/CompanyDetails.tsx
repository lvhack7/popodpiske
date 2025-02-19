// src/pages/CompanyDetails.tsx
import React from 'react';
import { Typography } from 'antd';

const { Title, Paragraph } = Typography;

const CompanyDetails: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Title level={2} className='font-rubik'>Реквизиты компании</Title>

      <Paragraph>
        <strong>Компания:</strong> ТОО ЧАСТНАЯ КОМПАНИЯ RELITALK LTD.
      </Paragraph>
      <Paragraph>
        <strong>Адрес:</strong> Казахстан, район &quot;Есиль&quot;, ПРОСПЕКТ УЛЫ ДАЛА, дом 58, кв/офис 116
      </Paragraph>
      <Paragraph>
        <strong>БИН (ИИН):</strong> 231040900076
      </Paragraph>
      <Paragraph>
        <strong>Банк:</strong> АО &quot;Kaspi Bank&quot;
      </Paragraph>
      <Paragraph>
        <strong>КБе:</strong> 17
      </Paragraph>
      <Paragraph>
        <strong>БИК:</strong> CASPKZKA
      </Paragraph>
      <Paragraph>
        <strong>Номер счёта:</strong> KZ78722S000038421108
      </Paragraph>
    </div>
  );
};

export default CompanyDetails;