import React, { Fragment, useCallback, useMemo } from 'react';
import { LinkOutlined, ExportOutlined } from '@ant-design/icons';
import { message } from 'antd';
import { hasProtocolFun } from '../../utils';
import { copy } from '../../utils/clipboard';
import './index.less';

interface LinkButtonProps {
    href?: string;
    children?: React.ReactNode;
    componentType?: 'a' | 'div';
    copyContent?: string;
}

const LinkButtonInner: React.FC<LinkButtonProps> = ({ href, children, componentType, copyContent }) => {
    const hasProtocol = hasProtocolFun(href);

    const handleCopy = useCallback(() => {
        message.success('链接已复制到剪贴板');
        copy(copyContent);
    }, [copyContent]);

    const defaultChildren = useMemo(() => {
        if (componentType === 'div') {
            return <Fragment><LinkOutlined /> 复制链接</Fragment>;
        }
        return <Fragment><ExportOutlined /> 打开页面</Fragment>;
    }, [componentType]);

    if (componentType === 'div') {
        return (
            <div className="link-preview-btn" onClick={handleCopy} title={copyContent}>
                {children || defaultChildren}
            </div>
        );
    }
    return (
        <a href={href} target={hasProtocol ? '_blank' : '_self'} rel={hasProtocol ? 'noopener' : undefined} className="link-preview-btn link-preview-btn-primary">
            {children || defaultChildren}
        </a>
    );
}

const LinkButton = React.memo(LinkButtonInner);

export default LinkButton;