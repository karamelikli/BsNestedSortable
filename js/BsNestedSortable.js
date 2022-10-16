/**
 * Bootstrap Nested sortable tree.
 *
 * @package BsNestedSortable
 * @license MIT
 * @version 1.3
 * @author Huseyin Karamelikli <hakperest@gmail.com>
 */

/**
 * 
 */

function BsNestedSortable() {
    var firstSerilized;
    var UInestedSortable = {
        options: {
            depth: 30,
            treeSelector: '#tree',
            branchSelector: '.tree-branch',
            branchPathSelector: '.branch-path',
            dragHandlerSelector: '.moveAble',
            placeholderName: 'sortable-placeholder',
            childrenBusSelector: '.children-bus',
            collapseChildren: '.collapseChildren',
            levelPrefix: 'branch-level',
            insertNewButton: '<button type="button" class="btn btn-primary btn-lg btn-block w-100">Insert New Branch</button>',
            imagesUrlPrefix: "",
			icons: {
                tag: "i",
                remove: '<i class="far fa-trash-alt"></i>',
                edit: '<i class="far fa-edit"></i>',
                add: '<i class="far fa-plus-square"></i>',
                Class: 'fas',
                expand: 'fa-plus',
                collapse: 'fa-minus',
            },

            modal: {
                id: "#myModal",
                ModalDelete: "#myModalDelete",
                name: "#CatName",
                description: "#CatDescId",
                image: "#image"
            },
            maxLevel: 3,
            rootID: 0,
            dataAttributes: {
                id: 'id',
                parent: 'parent',
                title: 'title',
            },
            dataKeys: {
                id: 'id',
                parent: 'parent_id',
                title: 'title',
                description: 'description',
                image: 'img'
            },
        },
        serializeOption: {
            serialize: false,
            method: "JSON",
            call: "html",
        },
        eventsOptions: {
            onComplete: function () { },
            onDelete: function () { },
            onEdit: function () { },
            onAdd: function () { },
            excludedObjElms: [],
        },
        run() {
            this.jQuerySupplements();
            this.initSorting();
            if (this.serializeOption.serialize === true) {
                firstSerilized = this.serialization().catObj;
            }
        },
        mapTheData(data) {
            return data.map(this.createBranch);
        },
        prepareData(data) {
            const { options: {
                dataKeys: { id, parent, title, description, image },
                rootID, maxLevel,
            } } = UInestedSortable;

            Object.keys(data).forEach(function (key, index) {
                if (typeof data[key][description] == "undefined") {
                    data[key][description] = "";
                }
                if (typeof data[key][image] == "undefined") {
                    data[key][image] = "";
                }
                if (typeof data[key][title] == "undefined") {
                    data[key][title] = "temp title";
                }
                if (typeof data[key][parent] == "undefined") {
                    data[key][parent] = rootID;
                }
            });
            let orderedData = [];
            const levelArr = [];
            const reOrder = function (i) {
                const items = data.filter(item => item[parent] == i);
                if (items.length > 0) {
                    $.each(items, function (index, value) {
                        const ThisId = value[id];
                        const ThisParent = value[parent];
                        let buCocuk = data.find(obj => {
                            return obj[id] == ThisId
                        });
                        let newLevel = 1;
                        if (ThisParent != rootID) {
                            let ThisParentObj = orderedData.filter(item => item[id] == ThisParent)[0]
                            newLevel = ThisParentObj["level"] + 1;
                            if (newLevel > maxLevel) {
                                newLevel = maxLevel;
                                buCocuk[parent] = ThisParentObj[parent];
                            }
                        }
                        levelArr[ThisId] = newLevel;
                        buCocuk["level"] = newLevel;
                        orderedData = orderedData.concat(buCocuk);
                        const ChildrenItems = data.filter(item => item[parent] == ThisId);
                        if (ChildrenItems.length > 0) {
                            reOrder(ThisId);
                        }
                    })
                } else {
                    let newLevel = 1;
                    if (i != rootID) {
                        newLevel = levelArr[i] + 1
                    }
                    levelArr[ThisId] = newLevel;
                    let buCocuk = data.find(obj => {
                        return obj[id] == i
                    });
                    buCocuk["level"] = newLevel;
                    orderedData = orderedData.concat(buCocuk)
                }
            }
            reOrder(rootID);
            return orderedData
        },
        MakeContents(data) {
            const { options: { treeSelector, insertNewButton, rootID, modal } } = UInestedSortable;
            if (data.length < 1 || typeof data.length != "number") {
                $(treeSelector).before($(insertNewButton).addClass("emptyButton").click(function () {
                    $("#parentOfThis").val(rootID);
                    $("#IsAddItem").val(true)
                    $(modal.id).modal('show');
                }));
            } else {
                return this.mapTheData(this.prepareData(data));
            }
        },
        html(Jid, data) {
            $(Jid).html(this.MakeContents(data))
            this.run()
        },
        getDistance(elementA, elementB) {
            const DistA = elementA.getBoundingClientRect();
            const DistB = elementB.getBoundingClientRect();
            const distanceX = Math.floor(Math.abs((DistA.left + DistA.width / 2) - (DistB.left + DistB.width / 2)));
            const distanceY = Math.floor(Math.abs((DistA.top + DistA.height / 2) - (DistB.top + DistB.height / 2)));
            return { distanceX, distanceY };
        },
        getSerialDiff() {
            const { options: { dataKeys: { id,parent,title,image,description } }, eventsOptions: { excludedObjElms }, serialize } = UInestedSortable;
            let oldObj = firstSerilized, 
                y =  serialize().catObj, deleted = [], added = [], modified = [];
            if (oldObj == y) { return false; }
            oldObj.map(function (n) {
                const yf = y.filter(ny => ny[id] == n[id]);
                if (yf.length > 0) {
                    const nYf = yf[0]; 
                    for (var p in n) {
                        if (typeof n[p] == "undefined" || typeof nYf[p] == "undefined") {
                            modified.push(n[p] == "undefined" ? nYf : n);
                            break;
                        } else {
                            if (n[p] !== nYf[p] && !excludedObjElms.includes(p)) {
                                if (Array.isArray(n[p])) {
                                    if (JSON.stringify(n[p].sort()) !== JSON.stringify(nYf[p].sort())) {
                                        modified.push(nYf);
                                        break;
                                    }
                                } else {
                                    modified.push(nYf);
                                    break;
                                }
                            }
                        }
                    }
                } else {
                    deleted.push(n);
                }
            })
            y.map(function (n) {
                const xf = oldObj.filter(nx => nx[id] == n[id]);
                if (xf.length == 0) {
                    added.push(n);
                } else {
                }
            });
            return { deleted: deleted, added: added, modified: modified ,theLastSerializ:y};
        },
        serialization() {
            const { options: { dataAttributes, treeSelector, rootID, dataKeys } } = UInestedSortable;
            const childrenArr = {}, parentArr = {}, allParentsArr = {}, allChildrenArr = { [rootID]: [] }, catObj = [];
            const babalarim = function (bu, idisi) {
                let babasi = bu.getParent();
                let buId = babasi.attr("data-" + dataAttributes.id);
                if (typeof buId !== 'undefined') {
                    allParentsArr[idisi].push(buId);
                    if (typeof allChildrenArr[buId] !== 'undefined') {
                        allChildrenArr[buId].push(idisi);
                    } else {
                        Object.assign(allChildrenArr, { [buId]: [idisi] })
                    }
                }
                if (babasi.length && babasi.getParent().length) {
                    babalarim(babasi, idisi);
                }
            }
            const assignValue = function (val, check = "typeof") {
                if (check == "typeof") {
                    return typeof val == "undefined" ? [] : val;
                }
                if (check == "text") {
                    return typeof val == "undefined" ? "" : val;
                }
            }
            $(treeSelector + " li").each(function () {
                idisi = $(this).attr("data-" + dataAttributes.id);
                Object.assign(allParentsArr, { [idisi]: [rootID] })
                allChildrenArr[rootID].push(idisi);
                const thisParent = $(this).attr("data-" + dataAttributes.parent);
                Object.assign(parentArr, { [idisi]: [thisParent] })
                if (typeof childrenArr[thisParent] == 'undefined') {
                    Object.assign(childrenArr, { [thisParent]: [idisi] })
                } else {
                    childrenArr[thisParent].push(idisi)
                }
                babalarim($(this), idisi);
            })
            catObj[rootID] = { 
                [dataKeys.id]: rootID,
                [dataKeys.parent]: "",
                level: 0,
                [dataKeys.title]: "Root",
                parents: [],
                children: [],
                [dataKeys.image]: "",
                [dataKeys.description]: "",
            }
            $(treeSelector + " li").each(function () {
                idisi = $(this).attr("data-" + dataAttributes.id);
                catObj[idisi] = {
                    [dataKeys.id]: idisi,
                    [dataKeys.parent]: $(this).attr("data-" + dataAttributes.parent),
                    level: $(this).attr("data-level"),
                    [dataKeys.title]: assignValue($(this).find(".branch-title").html(), "text"),
                    [dataKeys.image]: assignValue($(this).find(".branch-leftdivImage img").attr("src"), "text"),
                    [dataKeys.description]: assignValue($(this).find(".desc.d-none").html(), "text"),
                    parents: assignValue(allParentsArr[idisi]),
                    children: assignValue(allChildrenArr[idisi])
                }
            })
            const toHierarchy = function (id) {
                const Hierarchy = {
                    [dataKeys.id]: id,
                    [dataKeys.title]: catObj[id].text,
                    [dataKeys.parent]: catObj[id].parent,
                    parents: catObj[id].parents,
                    level: catObj[id].level,
                    [dataKeys.image]: catObj[id].image,
                    [dataKeys.description]: catObj[id].description,
                    children: [],
                }
                const minHierarchy = {
                    [dataKeys.id]: id,
                    [dataKeys.title]: catObj[id].text,
                }
                if (typeof childrenArr[id] !== 'undefined' && childrenArr[id].length) {
                    $.each(childrenArr[id], function (i, v) {
                        const childVals = toHierarchy(v)
                        Hierarchy.children.push(childVals.Hierarchy)
                        if (typeof minHierarchy.children == 'undefined') {
                            minHierarchy.children = [];
                        }
                        minHierarchy.children.push(childVals.minHierarchy)
                    })
                }
                return { Hierarchy: Hierarchy, minHierarchy: minHierarchy };
            }
            const HierarchyObj = toHierarchy(rootID), Hierarchy = HierarchyObj.Hierarchy, minHierarchy = HierarchyObj.minHierarchy;
            return { catObj, parentArr, childrenArr, minHierarchy, Hierarchy, allParentsArr, allChildrenArr }
        },
        serialize() {
            const { serializeOption: { method, outPuts, serialize, call }, serialization } = UInestedSortable;
            if (serialize == false) { return }

            const serobjs = serialization();
            if (typeof outPuts !== "undefined") {
                for (const [key, value] of Object.entries(outPuts)) {
                    for (const [key2, value2] of Object.entries(serobjs)) {
                        if (key == key2) {
                            switch (method) {
                                case "JSON":
                                    const newOutput = JSON.stringify(value2)
                                    if (call == "html") {
                                        $(value).html(newOutput)
                                    }
                                    if (call == "val") {
                                        $(value).val(newOutput)
                                    }
                                    break;
                                case "console":
                                    console.log(value); console.log(value2);
                                    break;
                                case "alert":
                                    alert(value);
                                    alert(value2);
                                    break;

                                case "asVar":
                                    const tempVar = value2;
                                    eval("globalThis." + key + "=tempVar")
                                    break;
                                default:
                                    break;
                            }
                        }
                    }
                }
            }
            return serobjs;
        },
        cleanSelector(selector) {
            return selector.replace(/^[\.#]/g, '');
        },
        getInstance() {
            return this;
        },
        getTreeEdge() {
            return $(UInestedSortable.options.treeSelector).offset().left;
        },
        pxToNumber(str) {
            return new RegExp('px$', 'i').test(str) ? str.slice(0, -2) * 1 : 0;
        },
        numberToPx(num) {
            return `${num}px`;
        },
        generateNewId() {
            const { options: { treeSelector, branchSelector, dataAttributes: { id } } } = UInestedSortable;
            const idArr = [];
            $(treeSelector + " " + branchSelector).map(function () {
                const tmpId = $(this).attr("data-" + id);
                if (Number(tmpId) == tmpId) {
                    idArr.push(Number(tmpId));
                }
            });
            return idArr.length == 0 ? 1 : Math.max.apply(null, idArr) + 1;
        },
        createBranch(thisObj) {
            const { options: { branchSelector, branchPathSelector, childrenBusSelector, levelPrefix, collapseChildren,
                icons: { add, edit, remove },
                dataKeys: { id: idKey, parent: parentKey, title: titleKey, description: descKey, image: imageKey },
                dataAttributes: { id: idAttr, parent: parentAttr },
                imagesUrlPrefix,
            }, cleanSelector, } = UInestedSortable;
            const { [idKey]: id, "level": level, [parentKey]: parent_id, [titleKey]: title, [imageKey]: imagePath } = thisObj;
            let { [descKey]: description } = thisObj, descriptionTxt = "";
            if (description) {
                descriptionTxt = description.replace(/(<([^>]+)>)/ig, "");
                description = description.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            } else {
                descriptionTxt = description = "";
            }
            const image = imagePath ? "<img src='" + imagesUrlPrefix + imagePath + "' />" : "";
            return `
                    <li class="${cleanSelector(
                branchSelector
            )} ${levelPrefix}-${level}" data-${idAttr}="${id}" data-${parentAttr}="${parent_id}" data-level="${level}">            
                                    <span class="${cleanSelector(branchPathSelector)}"></span>
                        <div class=" moveAble  branch-wrapper" >
                            <div   class="branch-leftdiv">                             
                                <button type="button"  class="button ${cleanSelector(collapseChildren)} " ></button>                           
                                <div  class="branch-leftdivImage">${image}</div>
                                <span class="branch-title">${title}</span> 
                            </div>   
                            <div class="branch-desc">${descriptionTxt}</div>
                            <div class="desc d-none"   >${description}</div>
                            <div class ="iconsDiv">
                                <button type="button" class="button edit-Icon" title="Edit Branch">${edit}</button>
                                <button type="button" class="button add-Icon" title="Add a new child">${add}</button>
                                <button type="button" class="button delete-Icon" title="Remove Branch">${remove}</button>
                            </div>                  
                        </div>             
                        <div class="${cleanSelector(childrenBusSelector)}"></div>
                    </li>
                `;
        },
        jQuerySupplements() {
            const { options } = UInestedSortable;
            const { levelPrefix } = options;

            $.fn.extend({
                getBranchLevel() {
                    if ($(this).length === 0) return 0;
                    const { depth } = options;
                    const margin = $(this).css('margin-left');

                    return /(px)|(em)|(rem)$/i.test(margin)
                        ? Math.floor(margin.slice(0, -2) / depth) + 1
                        : Math.floor(margin / depth) + 1;
                },
                updateBranchLevel(current, prev = null) {
                    return this.each(function () {
                        prev = prev || $(this).getBranchLevel() || 1;
                        $(this)
                            .removeClass(levelPrefix + '-' + prev)
                            .addClass(levelPrefix + '-' + current)
                            .data("level", current)
                            .attr(`data-level`, current);
                    });
                },
                shiftBranchLevel(dx) {
                    return this.each(function () {
                        let level = $(this).getBranchLevel() || 1,
                            newLevel = level + dx;

                        $(this)
                            .removeClass(levelPrefix + '-' + level)
                            .addClass(levelPrefix + '-' + newLevel)
                            .data(level, newLevel)
                            .attr(`data-level`, newLevel);
                    });
                },
                getParent() {
                    const {
                        options: { branchSelector },
                    } = UInestedSortable;
                    const level = $(this).getBranchLevel() || 1;
                    let $prev = $(this).prev(branchSelector);

                    while ($prev.length && $prev.getBranchLevel() >= level) {
                        $prev = $prev.prev(branchSelector);
                    }

                    return $prev;
                },
                getRootChild() {
                    const {
                        options: { branchSelector, treeSelector, levelPrefix },
                    } = UInestedSortable;

                    return $(treeSelector).children(`${branchSelector}.${levelPrefix}-1`);
                },
                getLastChild() {
                    const $children = $(this).getChildren();
                    const $descendants = $(this).getDescendants();
                    const $lastChild = $descendants.length > $children.length ? $descendants.last() : $children.last();
                    return $lastChild.length ? $lastChild : $();
                },
                getChildren() {
                    const { options: { branchSelector }, } = UInestedSortable;
                    let $children = $();
                    this.each(function () {
                        let level = $(this).getBranchLevel() || 1,
                            $next = $(this).next(branchSelector);
                        while ($next.length && $next.getBranchLevel() > level) {
                            if ($next.getBranchLevel() === level + 1) {
                                $children = $children.add($next);
                            }
                            $next = $next.next(branchSelector);
                        }
                    });
                    return $children;
                },
                getDescendants() {
                    const { options: { branchSelector } } = UInestedSortable;
                    let $descendants = $();
                    this.each(function () {
                        let level = $(this).getBranchLevel() || 1,
                            $next = $(this).next(branchSelector);
                        while ($next.length && $next.getBranchLevel() > level) {
                            $descendants = $descendants.add($next);
                            $next = $next.next(branchSelector);
                        }
                    });
                    return $descendants;
                },
                nextBranch() {
                    return $(this).next();
                },
                prevBranch() {
                    return $(this).prev();
                },
                nextSibling() {
                    const { options: { branchSelector } } = UInestedSortable;
                    let level = $(this).getBranchLevel() || 1,
                        $next = $(this).next(branchSelector),
                        nextLevel = $next.getBranchLevel();
                    while ($next.length && nextLevel > level) {
                        $next = $next.next(branchSelector);
                        nextLevel = $next.getBranchLevel();
                    }
                    return +nextLevel === +level ? $next : $();
                },
                prevSibling() {
                    const { options: { branchSelector } } = UInestedSortable;
                    let level = $(this).getBranchLevel() || 1,
                        $prev = $(this).prev(branchSelector),
                        prevLevel = $prev.getBranchLevel();
                    while ($prev.length && prevLevel > level) {
                        $prev = $prev.prev(branchSelector);
                        prevLevel = $prev.getBranchLevel();
                    }

                    return prevLevel === level ? $prev : $();
                },
                getLastSibling() {
                    let $nextSibling = $(this).nextSibling();
                    if (!$nextSibling.length) {
                        return $(this);
                    }
                    while ($nextSibling.length) {
                        const $temp = $nextSibling.nextSibling();
                        if ($temp.length) {
                            $nextSibling = $temp;
                        } else {
                            return $nextSibling;
                        }
                    }
                },
                getSiblings(level = null) {
                    const { options: { treeSelector, branchSelector } } = UInestedSortable;
                    level = level || $(this).getBranchLevel();
                    let $siblings = [],
                        $branches = $(`${treeSelector} > ${branchSelector}`),
                        $self = this;
                    $branches.length &&
                        $branches.each(function () {
                            let branchLevel = $(this).getBranchLevel();

                            if (+branchLevel === +level && $self[0] !== $(this)[0]) {
                                $siblings.push($(this));
                            }
                        });
                    return $siblings;
                },
                addIcons() {
                    const { options: { branchSelector, collapseChildren, icons: { tag, Class, collapse } } } = UInestedSortable;
                    $(branchSelector).each(function () {
                        if ($(this).getChildren().length) {
                            $(this).find(collapseChildren).html('<' + tag + ' class="' + Class + ' ' + collapse + '"></i>')
                        }
                    }
                    );
                },
                calculateSiblingDistances() {
                    const {
                        options: { branchSelector, branchPathSelector }, getDistance
                    } = UInestedSortable;

                    $(branchSelector).each(function () {
                        const level = $(this).getBranchLevel() || 1;
                        $(this).find(branchPathSelector).show();
                        if (typeof $(this).nextSibling !== 'function') return;
                        if (level > 1) {
                            const $sibling = $(this).nextSibling();
                            if ($sibling.length) {
                                const distance = getDistance($(this).get(0), $sibling.get(0));
                                var ThisParent = $(this).getParent() ? $(this).getParent() : $(this).getRootChild()
                                const distance2 = getDistance($(this).get(0), ThisParent.get(0));
                                $sibling
                                    .find(branchPathSelector)
                                    .css('height', `${Math.max(distance.distanceY + 15, 55)}px`);
                                $(this).find(branchPathSelector)
                                    .css('height', `${Math.max(distance2.distanceY + 15, 55)}px`);
                            } else {
                                const $nextBranch = $(this).next(branchSelector);
                                const nextBranchLevel = $nextBranch.getBranchLevel() || 1;
                                const isChild = $nextBranch.length > 0 && nextBranchLevel > level;
                                if (isChild) {
                                    $nextBranch.find(branchPathSelector).css('height', '55px');
                                }
                                if ($nextBranch.length > 0 && nextBranchLevel < level) {
                                    if ($(this).prevBranch().getBranchLevel() <= level) {
                                        $(this).find(branchPathSelector).css('height', '85px');
                                    }
                                }
                                if ($(this).prevBranch().getBranchLevel() < level) {
                                    $(this).find(branchPathSelector).css('height', '85px');
                                }
                            }
                        } else {
                            $(this).find(branchPathSelector).hide();
                        }
                    });
                },
                removeBranch() {
                    const {
                        options: { treeSelector, branchSelector },
                        updateBranchZIndex,
                    } = UInestedSortable;

                    const $branch = $(this).closest(`${treeSelector} ${branchSelector}`);
                    $descendants = $branch.getDescendants();

                    $descendants.each((_, element) => {
                        $(element).remove();
                    });

                    $branch.remove();
                    updateBranchZIndex();
                    serialize();
                },
                collapseThis(isChild = false) {
                    const {
                        options: { treeSelector, branchSelector, icons: { collapse, expand, Class } },
                    } = UInestedSortable;
                    const $branch = $(this).closest(`${treeSelector} ${branchSelector}`);
                    const $collapse = $branch.find(".collapseChildren ." + Class);
                    if ($collapse.hasClass(expand)) {
                        if (!isChild) { $collapse.removeClass(expand).addClass(collapse) }
                    } else {
                        if (!isChild) { $collapse.removeClass(collapse).addClass(expand) }
                    }
                    const branchVisibility = $branch.getChildren().is(":visible");
                    if (!isChild) {
                        if (branchVisibility) {
                            $branch.attr("data-collapsed", "hide");
                        } else {
                            $branch.attr("data-collapsed", "show");
                        }
                    }

                    $branch.getChildren().each(function () {
                        if (branchVisibility) {
                            $(this).hide();
                            if (!isChild) { $branch.attr("data-visibility", "hide"); }
                        } else {
                            $(this).show();
                            if (!isChild) { $branch.attr("data-visibility", "show"); }
                        }
                        if ($(this).getChildren().length) {
                            if ($(this).getChildren().is(":visible") == branchVisibility) {
                                if ($(this).attr("data-visibility") != "hide") {
                                    $(this).collapseThis(true)
                                }
                            }
                        }
                    })
                },
                updateCollapse() {
                    const {
                        options: { icons: { collapse, expand, Class } },
                    } = UInestedSortable;
                    const $collapse = $(this).find(".collapseChildren ." + Class);
                    if ($(this).attr("data-collapsed") == "hide") {
                        $collapse.removeClass(collapse).addClass(expand);
                    }
                }
            });
        },

        updateBranchZIndex() {
            const {
                options: { treeSelector, branchSelector }
            } = UInestedSortable;
            const $branches = $(`${treeSelector} > ${branchSelector}`);
            const length = $branches.length;
            $branches.length &&
                $branches.each(function (index) {
                    $(this).css('z-index', Math.max(1, length - index));
                });
        },
        initSorting() {
            const { options, eventsOptions, pxToNumber, numberToPx, updateBranchZIndex, serialize, getSerialDiff, generateNewId,
                createBranch, } = UInestedSortable;
            const {
                treeSelector,
                dragHandlerSelector,
                placeholderName,
                childrenBusSelector,
                branchPathSelector,
                branchSelector,
                levelPrefix,
                dataAttributes,
                collapseChildren,
                modal,
                maxLevel,
                dataKeys: { id: idAttr, parent: parentAttr, title: titleAttr, description: descriptionAttr, image: imageAttr, },
            } = options;

            updateBranchZIndex();
            let currentLevel = 1,
                originalLevel = 1,
                childrenBus = null,
                helperHeight = 0,
                originalIndex = 0;

            $(this).addIcons();
            $(document).on('click', collapseChildren, function () {
                $(this).collapseThis();
                $(this).calculateSiblingDistances();
            });
            $(document).on('click', '.delete-Icon', function () {
                $(modal.ModalDelete + " #IdOfDelete").val($(this).parents(branchSelector).attr("data-" + dataAttributes.id));
                $(modal.ModalDelete).modal('show');
            });
            $(modal.ModalDelete + " .Delete").on("click", function () {
                const id = $(modal.ModalDelete + " #IdOfDelete").val();
                const $branch = $(treeSelector + ' [data-' + dataAttributes.id + '="' + id + '"]');
                const $descendantsCount = $branch.getDescendants().length;
                if ($descendantsCount == 0) {
                    $branch.remove();
                    $(treeSelector).calculateSiblingDistances();
                    updateBranchZIndex();
                    //serialize();

                const newSerialize = getSerialDiff();
                    eventsOptions.onDelete($branch,newSerialize);
                } else {
                    $("#myModalDeleteAlert").modal('show');
                }
                $(modal.ModalDelete + " .close").click();
            })
            $(document).on('click', '.add-Icon,.edit-Icon', function () {
                const $branch = $(this).parents(branchSelector);
                const id = $branch.attr("data-" + dataAttributes.id);
                const IsAddItem = $(this).hasClass("add-Icon")
                if (!IsAddItem) {
                    const name = $branch.find(".branch-title").text();
                    const image = $branch.find(".branch-leftdivImage img").attr("src");
                    const desc = $branch.find(".desc.d-none").html().replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
                    $(modal.name).val(name);
                    $(modal.description).val(desc);
                    $(modal.image).val(image);
                }
                $("#parentOfThis").val(id);
                $("#IsAddItem").val($(this).hasClass("add-Icon"))
                $(modal.id).modal('show');
            });
            $(modal.id + " .close").on("click", function () {
                $(modal.name).val("");
                $(modal.description).val("");
                $(modal.image).val("");
                $("#parentOfThis").val("");
                $(modal.id).modal('hide');
            });
            $(modal.id + " .submit").on("click", function () {
                const IsAddItem = $("#IsAddItem").val();
                const parID = $("#parentOfThis").val();
                const $branch = $('*[data-' + dataAttributes.id + '="' + parID + '"]');
                const title = $(modal.name).val() ? $(modal.name).val() : "New Item";
                const description = $(modal.description).val();
                const image = $(modal.image).val();
                if (IsAddItem == "true") {
                    var uid = generateNewId();
                    const parent_id = $("#parentOfThis").val();
                    const level = Math.min(maxLevel, parseInt($branch.getBranchLevel()) + 1);
                    $lastChild = $branch.getLastChild();
                    const $element = createBranch({ [idAttr]: uid, [parentAttr]: parent_id, [titleAttr]: title, level: level, [descriptionAttr]: description, [imageAttr]: image });
                    if ($lastChild.length) {
                        $lastChild.after($element);
                    } else {
                        if ($branch.length) {
                            $branch.after($element);
                        } else {
                            $(treeSelector).html($element);
                            $(".emptyButton").remove();
                        }
                    }
                    $(treeSelector).addIcons();
                    $(treeSelector).calculateSiblingDistances();
                    updateBranchZIndex();

                } else {
                    $branch.find(".branch-title").text(title)
                    $branch.find(".desc.d-none").html(description);
                    $branch.find(".branch-desc").html(description.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
                    $branch.find(".branch-leftdivImage img").attr("src", image);

                }
                $(modal.id + " .close").click();
                const newSerialize = getSerialDiff();

                if (IsAddItem == "true") {
                    eventsOptions.onAdd($('*[data-' + dataAttributes.id + '="' + uid + '"]'), newSerialize);
                } else {
                    eventsOptions.onEdit($branch, newSerialize);
                }

            });

            $(this).calculateSiblingDistances();

            const updatePlaceholder = (placeholder, level) => {
                placeholder.updateBranchLevel(level);
                currentLevel = level;
            };

            const canSwapItems = ui => {
                let offset = ui.helper.offset(),
                    height = offset.top + helperHeight,
                    nextBranch = ui.placeholder.nextBranch(),
                    nextBranchOffset = nextBranch.offset() || 0,
                    nextBranchHeight = nextBranch.outerHeight();

                return height > nextBranchOffset.top + nextBranchHeight / 3;
            };
            serialize();
            $(treeSelector).sortable({
                handle: dragHandlerSelector,
                placeholder: placeholderName,
                items: '> *',
                start(_, ui) {
                    const level = ui.item.getBranchLevel();
                    ui.placeholder.updateBranchLevel(level);
                    originalIndex = ui.item.index();

                    /* const branchVisibility = ui.item.next().getDescendants().is(":visible");
                     if (branchVisibility == false) {
                         ui.item.addClass("ThisWasHidden")
                         ui.item.next().getDescendants().show()
                     }
 */
                    originalLevel = level;

                    childrenBus = ui.item.find(childrenBusSelector);
                    childrenBus.append(ui.item.next().getDescendants());

                    let height = childrenBus.outerHeight();
                    let placeholderMarginTop = ui.placeholder.css('margin-top');

                    height += height > 0 ? pxToNumber(placeholderMarginTop) : 0;
                    height += ui.helper.outerHeight();
                    helperHeight = height;
                    height -= 2;

                    let width = ui.helper.find(branchSelector).outerWidth() - 2;
                    ui.placeholder.css({ height, width });

                    const tmp = ui.placeholder.nextBranch();
                    tmp.css('margin-top', numberToPx(helperHeight));
                    ui.placeholder.detach();
                    $(this).sortable('refresh');
                    ui.item.after(ui.placeholder);
                    tmp.css('margin-top', 0);

                    currentLevel = level;
                    $(`${treeSelector} ${branchSelector} ${branchPathSelector}`).hide();
                },
                sort(_, ui) {
                    const { options, getTreeEdge } = UInestedSortable;
                    const { depth, maxLevel } = options;
                    let treeEdge = getTreeEdge(),
                        offset = ui.helper.offset(),
                        currentBranchEdge = offset.left,
                        lowerBound = 1,
                        upperBound = maxLevel;

                    let prevBranch = ui.placeholder.prevBranch();
                    prevBranch = prevBranch[0] === ui.item[0] ? prevBranch.prevBranch() : prevBranch;

                    let prevBranchLevel = prevBranch.getBranchLevel();
                    upperBound = Math.min(prevBranchLevel + 1, maxLevel);

                    let nextSibling = ui.placeholder.nextSibling(),
                        placeholderLevel = 1;

                    if (nextSibling.length) {
                        placeholderLevel = ui.placeholder.getBranchLevel() || 1;
                    } else {
                        let nextBranch = ui.placeholder.nextBranch();
                        placeholderLevel = nextBranch.getBranchLevel() || 1;
                    }

                    lowerBound = Math.max(1, placeholderLevel);
                    let position = Math.max(0, currentBranchEdge - treeEdge);
                    let newLevel = Math.floor(position / depth) + 1;
                    newLevel = Math.max(lowerBound, Math.min(newLevel, upperBound));
                    if (canSwapItems(ui)) {
                        let nextBranch = ui.placeholder.nextBranch();

                        if (nextBranch.getDescendants().length) {
                            newLevel = nextBranch.getBranchLevel() + 1;
                        }

                        nextBranch.after(ui.placeholder);
                        $(this).sortable('refreshPositions');
                    }
                    updatePlaceholder(ui.placeholder, newLevel);
                },
                change(_, ui) {
                    let prevBranch = ui.placeholder.prevBranch();

                    prevBranch = prevBranch[0] === ui.item[0] ? prevBranch.prevBranch() : prevBranch;

                    let prevBranchLevel = prevBranch.getBranchLevel() || 1;

                    if (prevBranch.length) {
                        ui.placeholder.detach();
                        let children = prevBranch.getDescendants();
                        if (children && children.length) prevBranchLevel += 1;
                        ui.placeholder.updateBranchLevel(prevBranchLevel);
                        prevBranch.after(ui.placeholder);
                    }
                },
                stop(_, ui) {
                    $(`${branchSelector}:not(${levelPrefix}-1) ${branchPathSelector}`).show();
                    const children = childrenBus.children().insertAfter(ui.item);

                    childrenBus.empty();

                    if (ui.item.next().getDescendants().length == 0) {
                        $(collapseChildren).html("")
                    }
                    ui.item.updateBranchLevel(currentLevel);
                    children.shiftBranchLevel(currentLevel - originalLevel);

                    $(this).addIcons();
                    $(this).calculateSiblingDistances();
                    updateBranchZIndex();

                    const $parent = ui.item.getParent();
                    ui.item
                        .data(dataAttributes.parent, $parent.data(dataAttributes.id))
                        .attr(`data-${dataAttributes.parent}`, $parent.data(dataAttributes.id));
                    serialize();
                    if (currentLevel !== originalLevel || originalIndex !== ui.item.index()) {
                        eventsOptions.onComplete(ui, getSerialDiff());
                    }

                    if (children.length > 0) {
                        ui.item.updateCollapse()
                        children.each(function () {
                            $(this).updateCollapse()
                        })
                    }
                },
            });
        },
    };

    return UInestedSortable;
}
jQuery.fn.BsNestedSortable = function (input) {
    data = (input.hasOwnProperty("data")) ? input.data : data; // check data was put in the option or not! if not data was defined outside of input object

    const sortable = new BsNestedSortable();
    let treeSelector = "";
    if ($(this[0]).attr("id")) {
        treeSelector += "#" + $(this[0]).attr("id");
    }
    if ($(this[0]).attr("class")) {
        treeSelector += "." + $.trim($(this[0]).attr("class")).replace(/\s/gi, ".");
    }
    sortable.options = { ...sortable.options, ...{ treeSelector: treeSelector } }
    if (input.hasOwnProperty("options")) {
        sortable.options = { ...sortable.options, ...input.options };
    }
    $(this[0]).html(sortable.MakeContents(data));
    if (typeof input.serialize !== "undefined") {
        sortable.serializeOption = { ...sortable.serializeOption, ...input.serialize, ...{ serialize: true } }
    }
    if (typeof input.eventsOptions !== "undefined") {
        // serialize before events
        sortable.serializeOption = { ...sortable.serializeOption, ...{ serialize: true } }
        sortable.eventsOptions = { ...sortable.eventsOptions, ...input.eventsOptions }
    }
    sortable.run();
    return this;
}
